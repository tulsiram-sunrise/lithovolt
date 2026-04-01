# Lithovolt Unified Catalog Architecture Redesign

**Date:** March 31, 2026  
**Objective:** Consolidate redundant BatteryModel, Product, and Category systems into a single, scalable, polymorphic catalog architecture  
**Scope:** Complete schema redesign, data migration, API unification, and frontend refactor

---

## Executive Summary

The codebase currently maintains **three parallel inventory systems** (BatteryModel, Product, Unified Catalog) with 22+ duplicated columns, dual foreign key references in dependent tables, and confusing data flows. This document proposes a completely unified **polymorphic catalog architecture** designed for:

- ✅ **Single source of truth** for all inventory items
- ✅ **Type-safe schema** with dedicated columns per product type
- ✅ **Future-proof extensibility** (replace batteries, solar, inverters, services without data model surgery)
- ✅ **Simplified relationships** (SerialNumber, Warranty, OrderItem point to one canonical table)
- ✅ **Better query performance** (typed columns, proper indices, no JSON operators)
- ✅ **Reduced code duplication** (one controller, one API, one data flow)

---

## Part 1: Current State vs. Proposed State

### Current Architecture Problems

| Problem | Manifestation | Impact |
|---------|---------------|--------|
| **Triple Systems** | BatteryModel, Product, UnifiedCatalog endpoints | Confusion about which to use; different response formats |
| **Redundant Columns** | name, sku, price, quantity in battery_models AND products | Updates to one source require syncing both; 2+ sources of truth |
| **Dual FK References** | SerialNumber.{battery_model_id, product_id}, Warranty.{battery_model_id, product_id} | Unclear which is authoritative; queries must check both |
| **JSON Metadata** | 22 battery fields stored in Product.metadata | No type validation; complex filtering queries; unclear schema |
| **Capability Logic** | Duplicated in ProductController + CatalogItemController | DRY violation; risk of divergence |
| **One-to-One Mapping** | UNIQUE(legacy_battery_model_id), UNIQUE(legacy_accessory_id) | Prevents future many-to-many scenarios (e.g., product variants) |
| **Inconsistent Warranties** | BatteryModel.warranty_months vs Product.default_warranty_months vs Product.metadata['warranty_months'] | Unclear which field is canonical |

### Proposed Architecture Benefits

Using a **single CatalogItem table** with **type-aware columns**:

```
┌─────────────────────────────────────────────┐
│        catalog_items (500+ cols)            │
│  (base fields + type-specific columns)      │
│                                              │
│  Examples:                                  │
│  • All types: name, sku, price, status      │
│  • BATTERY only: voltage, capacity, cca     │
│  • ACCESSORY only: compatible_types[]       │
│  • SERVICE only: duration_days, hourly_rate │
└─────────────────────────────────────────────┘
         ↓                                     
    Single API endpoint                      
    Single permission model                   
    Single audit trail                        
    Type-agnostic frontend
```

---

## Part 2: New Database Schema Design

### 2.1 Core Table: `catalog_items`

**Rationale:** Single canonical table for all product/service offerings, with type-aware column layout and extensible metadata fallback.

```sql
CREATE TABLE catalog_items (
    -- Core Identity
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    type ENUM('BATTERY', 'ACCESSORY', 'PART', 'CONSUMABLE', 'SERVICE', 'GENERIC') NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,  -- For SEO URLs
    
    -- Categorization (replaced product_categories FK)
    category_path VARCHAR(500)  -- Denormalized "Electronics > Batteries > Lithium" for perf
    
    -- Commercial
    description TEXT NULL,
    image_url VARCHAR(500) NULL,
    price DECIMAL(12, 2) NOT NULL DEFAULT 0,
    cost_price DECIMAL(12, 2) NULL,  -- For margin calculations
    markup_percentage DECIMAL(5, 2) NULL,
    
    -- Inventory
    total_quantity INT UNSIGNED DEFAULT 0,
    available_quantity INT UNSIGNED DEFAULT 0,
    reserved_quantity INT UNSIGNED DEFAULT 0,  -- Track pending orders
    low_stock_threshold INT UNSIGNED DEFAULT 5,
    reorder_quantity INT UNSIGNED DEFAULT 10,
    
    -- Capabilities (type-aware booleans)
    is_active BOOLEAN DEFAULT true,
    is_serialized BOOLEAN DEFAULT false,  -- true if type='BATTERY'
    is_warranty_eligible BOOLEAN DEFAULT false,
    is_fitment_eligible BOOLEAN DEFAULT false,  -- For electrical products
    is_returnable BOOLEAN DEFAULT true,
    allows_backorder BOOLEAN DEFAULT false,
    
    -- Warranty (unified from multiple sources)
    default_warranty_months INT UNSIGNED NULL,
    private_warranty_months INT UNSIGNED NULL,  -- Consumer warranty
    commercial_warranty_months INT UNSIGNED NULL,  -- Bulk/commercial warranty
    warranty_coverage_type ENUM('FULL', 'PARTIAL', 'MANUFACTURING') DEFAULT 'MANUFACTURING',
    
    -- Type-Specific: BATTERY (stored in columns, NEVER in JSON)
    -- Electrical specs
    voltage_nominal DOUBLE(8, 2) NULL,  -- Nominal voltage
    capacity_ah DOUBLE(10, 3) NULL,  -- Amp-hour capacity
    capacity_wh DOUBLE(10, 3) NULL,  -- Watt-hour capacity
    chemistry VARCHAR(120) NULL,  -- Lithium, AGM, Lead-Acid, etc.
    battery_type VARCHAR(120) NULL,  -- LiFePO4, NMC, etc.
    
    -- Power/Performance
    max_charge_current_a DOUBLE(8, 2) NULL,
    max_discharge_current_a DOUBLE(8, 2) NULL,
    cca INT UNSIGNED NULL,  -- Cold Cranking Amps (lead-acid)
    reserve_capacity INT UNSIGNED NULL,  -- Reserve capacity minutes
    
    -- Physical
    length_mm DECIMAL(8, 2) NULL,
    width_mm DECIMAL(8, 2) NULL,
    height_mm DECIMAL(8, 2) NULL,
    total_height_mm DECIMAL(8, 2) NULL,
    unit_weight_kg DECIMAL(8, 3) NULL,
    terminal_type VARCHAR(120) NULL,  -- Standard, Anderson, etc.
    terminal_layout VARCHAR(120) NULL,
    hold_down VARCHAR(120) NULL,
    vent_type VARCHAR(120) NULL,
    group_size VARCHAR(120) NULL,  -- For compatibility
    
    -- Battery Maintenance
    maintenance_free BOOLEAN DEFAULT false,
    charge_voltage_range VARCHAR(50) NULL,  -- e.g., "13.6V - 14.6V"
    depth_of_discharge_percent DECIMAL(5, 2) NULL,
    cycle_life INT UNSIGNED NULL,  -- 3000, 5000, etc.
    bms_included BOOLEAN DEFAULT false,
    
    -- Type-Specific: ACCESSORY
    compatible_types JSON NULL,  -- e.g., ["BATTERY", "INVERTER"]
    
    -- Type-Specific: SERVICE
    duration_days INT UNSIGNED NULL,
    hourly_rate DECIMAL(10, 2) NULL,
    max_concurrent_sessions INT UNSIGNED NULL,  -- Capacity limit
    
    -- Brand & Model
    brand VARCHAR(120) NULL,
    series VARCHAR(120) NULL,
    model_code VARCHAR(120) NULL,
    model_year INT UNSIGNED NULL,
    
    -- Documentation & Support
    datasheet_url VARCHAR(500) NULL,
    user_manual_url VARCHAR(500) NULL,
    support_contact VARCHAR(255) NULL,
    application_segment VARCHAR(180) NULL,
    
    -- Audit & Lifecycle
    published_at TIMESTAMP NULL,
    discontinued_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,  -- Soft deletes
    
    -- Extensibility (fallback for future fields without schema changes)
    metadata JSON NULL,  -- Flexible k-v store for edge cases
    
    -- Legacy Compatibility (temporary, for smooth migration)
    legacy_battery_model_id BIGINT UNSIGNED NULL UNIQUE,
    legacy_accessory_id BIGINT UNSIGNED NULL UNIQUE,
    legacy_product_id BIGINT UNSIGNED NULL UNIQUE,
    
    -- Full-text search optimization
    search_tokens VARCHAR(1000) GENERATED ALWAYS AS (
        CONCAT_WS('|', id, sku, name, brand, series, model_code, type)
    ) STORED
);

-- Indices for performance
CREATE INDEX idx_type ON catalog_items(type);
CREATE INDEX idx_type_active ON catalog_items(type, is_active);
CREATE INDEX idx_sku ON catalog_items(sku);
CREATE INDEX idx_category_path ON catalog_items(category_path);
CREATE INDEX idx_available_quantity ON catalog_items(available_quantity);
CREATE FULLTEXT INDEX idx_search ON catalog_items(name, description, brand, model_code);
CREATE INDEX idx_deleted_at ON catalog_items(deleted_at);
```

#### Column Organization Strategy

| Group | Purpose | Typical Values |
|-------|---------|-----------------|
| **Identity** (id, type, sku) | Unique identification | BATTERY, ACCESSORY, PART |
| **Commerce** (price, quantity) | Inventory & sales | 15000, 100 units |
| **Capabilities** (is_serialized, is_warranty) | Feature flags | true/false |
| **BATTERY Columns** (voltage, capacity, chemistry) | Battery-specific specs | 48V, 100Ah, Lithium |
| **Physical** (length_mm, weight_kg) | Dimension data | 650mm, 25.5kg |
| **Warranty** (default_warranty_months, coverage_type) | Warranty rules | 24, FULL |
| **Documentation** (datasheet_url, user_manual_url) | Support resources | URLs |
| **Audit** (created_at, updated_at, deleted_at) | History tracking | timestamps |
| **Legacy** (legacy_battery_model_id) | Migration bridge | temporary FKs |

**Key Design Decisions:**

1. **No JSON for batteries** — All battery-specific columns are typed (voltage, capacity, etc.), not in metadata. JSON is used only for edge cases.
2. **Type-aware columns** — NULL for irrelevant types (e.g., ACCESSORY rows have NULL voltage). Queries can leverage this.
3. **One-to-many legacy mapping** — legacy_battery_model_id is UNIQUE but non-NULL-enforced, allowing gradual data migration.
4. **Denormalized category_path** — Storing full hierarchical path for fast filtering without JOIN.
5. **Generated search_tokens** — Stored computed column for FULLTEXT search without runtime concatenation.

---

### 2.2 Supporting Tables

#### A) `catalog_categories` (Many-to-Many Association)

**Replaces:** product_categories (but enhanced with hierarchy)

```sql
CREATE TABLE catalog_categories (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) UNIQUE NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT NULL,
    parent_id BIGINT UNSIGNED NULL,
    
    -- Denormalization for hierarchy queries
    level INT UNSIGNED DEFAULT 0,  -- 0 = root, 1 = child, etc.
    path VARCHAR(500) GENERATED ALWAYS AS (
        -- Computed full path like "Electronics > Batteries > Lithium"
        -- Can use GROUP_CONCAT in trigger
    ) STORED,
    
    -- Filtering & display
    is_active BOOLEAN DEFAULT true,
    display_order INT UNSIGNED DEFAULT 0,
    icon_url VARCHAR(500) NULL,
    color_hex VARCHAR(7) NULL,  -- For UI rendering
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_id) REFERENCES catalog_categories(id) ON DELETE SET NULL,
    INDEX idx_parent_id (parent_id),
    INDEX idx_active (is_active)
);

-- NEW: Many-to-many bridge (replaces single category_id FK)
CREATE TABLE catalog_item_categories (
    catalog_item_id BIGINT UNSIGNED NOT NULL,
    catalog_category_id BIGINT UNSIGNED NOT NULL,
    is_primary BOOLEAN DEFAULT false,  -- One category can be "primary"
    
    PRIMARY KEY (catalog_item_id, catalog_category_id),
    FOREIGN KEY (catalog_item_id) REFERENCES catalog_items(id) ON DELETE CASCADE,
    FOREIGN KEY (catalog_category_id) REFERENCES catalog_categories(id) ON DELETE CASCADE,
    INDEX idx_category_id (catalog_category_id)
);
```

**Benefits:**
- Product can belong to multiple categories (e.g., "Batteries" AND "Inverter Accessories")
- Primary category for sorting when needed
- Cleaner than denormalized category_path alone

#### B) `catalog_variations` (Optional Multi-Variant Support)

**Use Case:** A battery model comes in 48V/100Ah and 48V/200Ah variants

```sql
CREATE TABLE catalog_variations (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    catalog_item_id BIGINT UNSIGNED NOT NULL,
    sku_suffix VARCHAR(50) NULL,  -- e.g., "-100AH", "-200AH"
    name_suffix VARCHAR(100) NULL,  -- e.g., "100Ah Variant"
    
    -- Variant-specific overrides
    price DECIMAL(12, 2) NULL,  -- NULL = use parent price
    image_url VARCHAR(500) NULL,  -- NULL = use parent image
    
    -- Variant-specific specs (subset of parent columns)
    capacity_ah DOUBLE(10, 3) NULL,  -- Override for this variant
    capacity_wh DOUBLE(10, 3) NULL,
    
    total_quantity INT UNSIGNED DEFAULT 0,
    available_quantity INT UNSIGNED DEFAULT 0,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    
    FOREIGN KEY (catalog_item_id) REFERENCES catalog_items(id) ON DELETE CASCADE,
    UNIQUE(catalog_item_id, sku_suffix)
);
```

**Use in ordering:** OrderItem can reference catalog_item_id + variation_id (optional)

---

### 2.3 Migration of Dependent Tables

#### A) `serial_numbers` (Update FK)

**Before:**
```sql
ALTER TABLE serial_numbers MODIFY battery_model_id BIGINT UNSIGNED NULL;
ALTER TABLE serial_numbers ADD COLUMN product_id BIGINT UNSIGNED NULL;
ALTER TABLE serial_numbers ADD FOREIGN KEY (product_id) REFERENCES products(id);
```

**After:**
```sql
-- Drop old columns
ALTER TABLE serial_numbers DROP COLUMN battery_model_id;
ALTER TABLE serial_numbers DROP COLUMN product_id;

-- Add new canonical column
ALTER TABLE serial_numbers ADD COLUMN catalog_item_id BIGINT UNSIGNED NOT NULL AFTER id;
ALTER TABLE serial_numbers ADD FOREIGN KEY (catalog_item_id) REFERENCES catalog_items(id) ON DELETE CASCADE;
```

#### B) `warranties` (Update FK)

```sql
ALTER TABLE warranties DROP COLUMN battery_model_id;
ALTER TABLE warranties DROP COLUMN product_id;
ALTER TABLE warranties ADD COLUMN catalog_item_id BIGINT UNSIGNED NOT NULL;
ALTER TABLE warranties ADD FOREIGN KEY (catalog_item_id) REFERENCES catalog_items(id);
```

#### C) `order_items` (Drop Polymorphic, Use Direct FK)

**Before:**
```sql
-- Polymorphic: itemable_type ('Battery', 'Accessory') + itemable_id
-- Plus: product_id FK (redundant)
```

**After:**
```sql
-- Simplify to direct FK
ALTER TABLE order_items DROP COLUMN itemable_type;
ALTER TABLE order_items DROP COLUMN itemable_id;
ALTER TABLE order_items DROP COLUMN product_id;
ALTER TABLE order_items ADD COLUMN catalog_item_id BIGINT UNSIGNED NOT NULL;
ALTER TABLE order_items ADD COLUMN variation_id BIGINT UNSIGNED NULL;  -- For multi-variant support
ALTER TABLE order_items ADD FOREIGN KEY (catalog_item_id) REFERENCES catalog_items(id);
ALTER TABLE order_items ADD FOREIGN KEY (variation_id) REFERENCES catalog_variations(id) ON DELETE SET NULL;

-- Add quantity tracks
ALTER TABLE order_items MODIFY quantity INT UNSIGNED NOT NULL DEFAULT 1;
```

---

## Part 3: Implementation Phasing

### Phase 1: Schema Creation (0 downtime)

**Goal:** Create new schema alongside existing, no deletions or renames yet.

1. Create `catalog_items` table (empty)
2. Create `catalog_categories` table
3. Create `catalog_item_categories` bridge table
4. Optionally create `catalog_variations` table
5. Add legacy FK columns to serial_numbers, warranties (as NULL, non-enforced)

**Effort:** 2-3 hours (SQL writing, testing)  
**Risk:** None (only additions)

### Phase 2: Data Migration (tested in staging, scheduled downtime for prod)

**Goal:** Populate new schema from legacy data.

```
Step 1: BatteryModel → CatalogItem
  FOR EACH battery_model row:
    → INSERT into catalog_items (type='BATTERY', sku=model.sku, ...)
    → Get new catalog_item.id
    → UPDATE serial_numbers SET catalog_item_id=new_id WHERE battery_model_id=old_id
    → Keep legacy_battery_model_id for audit trail

Step 2: Accessory → CatalogItem
  FOR EACH accessory row:
    → INSERT into catalog_items (type='ACCESSORY', ...)
    → UPDATE order_items SET catalog_item_id=new_id WHERE itemable_type='Accessory'

Step 3: Warranty → Point to new CatalogItem
  FOR EACH warranty where battery_model_id IS NOT NULL:
    → Find serialNumber by serial_number_id
    → Get related catalog_item_id from serial_numbers
    → UPDATE warranty SET catalog_item_id=...

Step 4: Cleanup legacy columns
  ALTER TABLE serial_numbers DROP COLUMN battery_model_id;
  ALTER TABLE warranties DROP COLUMN battery_model_id;
  ALTER TABLE order_items DROP COLUMN itemable_type/itemable_id;
```

**Effort:** 4-6 hours (script testing, data validation, rollback prep)  
**Risk:** Data loss if script fails; **requires backup + rollback plan**  
**Downtime:** 5-10 minutes (read-only mode during script execution)

### Phase 3: API Layer Refactor

**Goal:** Single endpoint, single response format.

1. **Create new CatalogItemController** with unified logic
2. **Deprecate old endpoints** (redirect with 301 Content-Moved-Permanently)
3. **Update authorization** to use single permission model
4. **Add data transformer** for consistent response format

**Files:**
- `backend-laravel/app/Http/Controllers/Api/CatalogItemController.php` (NEW, ~400 lines)
- `backend-laravel/routes/api.php` (remove /inventory/models, /inventory/products)
- `backend-laravel/app/Models/CatalogItem.php` (NEW)
- `backend-laravel/app/Models/CatalogCategory.php` (ENHANCED from ProductCategory)

**Effort:** 3-4 hours  
**Risk:** API consumer breakage (handled by deprecation redirect)

### Phase 4: Frontend Migration

**Goal:** All components use `/inventory/catalog` endpoint.

1. **Update API service layer** (`frontend/src/services/api.js`)
2. **Consolidate list/detail components** (remove BatteryModelPage, ProductPage duplicates)
3. **Type-aware rendering** (single ItemDetail component with type switches)
4. **Category filtering** (new UI for multi-category selection)

**Files:**
- `frontend/src/pages/admin/CatalogManagementPage.jsx` (NEW, replaces BatteryModels+Products)
- `frontend/src/pages/admin/CatalogDetailPage.jsx` (NEW, unified detail)
- `frontend/src/pages/customer/CatalogPage.jsx` (updated)
- `frontend/src/services/api.js` (refactored)

**Effort:** 4-5 hours  
**Risk:** UX regression if type-specific rendering not handled correctly

### Phase 5: Cleanup

**Goal:** Remove legacy tables after grace period (2-4 weeks for safety).

1. Drop `products` table
2. Drop `battery_models` table
3. Drop `accessories` table
4. Drop `product_categories` table (replaced by catalog_categories)
5. Remove legacy FK columns from catalog_items

**Effort:** 1 hour  
**Risk:** None (final cleanup only)

---

## Part 4: API Design (Unified Endpoint)

### Single Endpoint: `GET /inventory/catalog`

**Query Parameters:**
```
GET /inventory/catalog
  ?type=BATTERY              # Filter by product type
  &category=Lithium%20Batteries  # Filter by category (denormalized path)
  &q=12V%20100Ah            # Full-text search
  &in_stock=true            # Only available_quantity > 0
  &page=1&per_page=20       # Pagination
  &sort=price,-name         # Sorting
  &fields=id,name,price,type  # Field projection
```

**Response Format (Unified):**
```json
{
  "data": [
    {
      "id": 1,
      "type": "BATTERY",
      "sku": "LV-BATT-48-100",
      "name": "LithoVolt 48V 100Ah Pro Battery",
      "category": {
        "id": 5,
        "name": "Lithium Batteries",
        "path": "Electronics > Batteries > Lithium"
      },
      "price": 15000,
      "availability": {
        "total": 100,
        "available": 45,
        "reserved": 10,
        "status": "IN_STOCK"
      },
      "specifications": {
        "voltage": 48,
        "capacity_ah": 100,
        "capacity_wh": 4800,
        "chemistry": "LiFePO4",
        "bms_included": true,
        "cycle_life": 5000
      },
      "warranty": {
        "default_months": 24,
        "coverage_type": "FULL"
      },
      "capabilities": {
        "serialized": true,
        "warranty_eligible": true,
        "fitment_eligible": false
      },
      "media": {
        "image_url": "https://...",
        "datasheet_url": "https://..."
      }
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total": 234,
    "last_page": 12
  }
}
```

**Type-Specific Response Augmentation:**

```php
// CatalogItemController transforms based on type
private function transformBattery(CatalogItem $item): array {
    return [
        ...base_transformation(),
        'specifications' => [
            'voltage' => $item->voltage_nominal,
            'capacity_ah' => $item->capacity_ah,
            'capacity_wh' => $item->capacity_wh,
            'chemistry' => $item->chemistry,
            'cca' => $item->cca,
            'bms_included' => $item->bms_included,
        ]
    ];
}

// Accessory response
private function transformAccessory(CatalogItem $item): array {
    return [
        ...base_transformation(),
        'compatible_types' => $item->compatible_types,
    ];
}
```

---

## Part 5: Migration Path (Data)

### Pre-Migration Checklist

- [ ] Backup production database
- [ ] Test migration script in staging environment
- [ ] Prepare rollback procedure
- [ ] Notify stakeholders of scheduled downtime
- [ ] Update API documentation
- [ ] Create data validation audit queries

### Migration Script Pseudocode

```php
// database/migrations/2026_03_31_000012_migrate_to_unified_catalog.php

Schema::create('catalog_items', function (Blueprint $table) {
    // ... (full schema as defined in Part 2.1)
});

// Phase 2a: Migrate BatteryModel → CatalogItem
$batteryModels = DB::table('battery_models')->get();
foreach ($batteryModels as $bm) {
    $catalogId = DB::table('catalog_items')->insertGetId([
        'type' => 'BATTERY',
        'sku' => $bm->sku,
        'name' => $bm->name,
        'slug' => Str::slug($bm->name),
        'description' => $bm->description,
        'price' => $bm->price,
        'total_quantity' => $bm->total_quantity,
        'available_quantity' => $bm->available_quantity,
        'is_serialized' => true,
        'is_warranty_eligible' => true,
        
        // Battery-specific columns
        'voltage_nominal' => $bm->voltage,
        'capacity_ah' => $bm->capacity_ah ?? $bm->capacity,
        'chemistry' => $bm->chemistry,
        'battery_type' => $bm->battery_type,
        'cca' => $bm->cca,
        'reserve_capacity' => $bm->reserve_capacity,
        'length_mm' => $bm->length_mm,
        'width_mm' => $bm->width_mm,
        'height_mm' => $bm->height_mm,
        'terminal_type' => $bm->terminal_type,
        'hold_down' => $bm->hold_down,
        'vent_type' => $bm->vent_type,
        'group_size' => $bm->group_size,
        'maintenance_free' => $bm->maintenance_free,
        'private_warranty_months' => $bm->private_warranty_months,
        'commercial_warranty_months' => $bm->commercial_warranty_months,
        'unit_weight_kg' => $bm->unit_weight_kg,
        'datasheet_url' => $bm->datasheet_url,
        'application_segment' => $bm->application_segment,
        
        'legacy_battery_model_id' => $bm->id,
        'created_at' => $bm->created_at,
        'updated_at' => $bm->updated_at,
    ]);

    // Update serial_numbers
    DB::table('serial_numbers')
        ->where('battery_model_id', $bm->id)
        ->update(['catalog_item_id' => $catalogId]);
}

// Phase 2b: Similar for Accessories
// Phase 2c: Update Warranties and OrderItems (FKs)
```

---

## Part 6: Backward Compatibility & Deprecation

### Graceful Deprecation Timeline

**Week 1: Dual-Write Phase**
- New code writes to both legacy and new tables
- Reads primary from new table, log discrepancies
- Frontend uses `/inventory/catalog` endpoint

**Week 2-3: Legacy Redirect**
- Old endpoints (`/inventory/models`, `/inventory/products`) return 301 redirect to new endpoint
- Any client still using old endpoints gets redirected

**Week 4: Removal**
- Remove legacy controllers and routes
- Drop legacy tables
- Remove `legacy_*` FK columns from catalog_items

### Compatibility Mode (Optional)

If certain integrations need active legacy endpoints (e.g., 3rd-party API consumers):

```php
// LegacyBatteryModelController.php (deprecated)
public function index() {
    return redirect('/inventory/catalog?type=BATTERY', 301);
}

public function show($id) {
    $item = CatalogItem::where('legacy_battery_model_id', $id)->firstOrFail();
    return redirect("/inventory/catalog/{$item->id}", 301);
}
```

---

## Part 7: Benefits Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Data Tables** | 3 (battery_models, products, accessories) | 1 (catalog_items) |
| **API Endpoints** | 3 (/inventory/models, /products, /catalog) | 1 (/inventory/catalog) |
| **Controllers** | 3+ (BatteryModel, Product, Catalog) | 1 (CatalogItem) |
| **FK Dependencies** | Multiple branches (itemable, legacy refs) | Single source (catalog_item_id) |
| **Columns** | 50+ (spread across tables) | 60+ (organized by type) |
| **Type Safety** | JSON metadata for batteries | Typed columns (voltage, capacity, etc.) |
| **Query Complexity** | JOINs + JSON operators + permission logic | Single table + proper indices |
| **New Product Types** | Requires schema migration | Add columns + type case handling |
| **Frontend Consolidation** | 3 list views, 3 detail views | 1 list view, 1 detail view (type-aware) |
| **Onboarding Cost** | New dev must learn 3 systems | New dev learns 1 unified system |

---

## Part 8: Implementation Roadmap

| Phase | Task | Hours | Start | End | Notes |
|-------|------|-------|-------|-----|-------|
| **1** | Schema design + review | 2 | W1 Mon | W1 Tue | Include in this design doc |
| **1** | Create migrations for new tables | 1 | W1 Tue | W1 Tue | catalog_items, categories, variations |
| **2** | Write data migration script | 3 | W1 Wed | W1 Thu | Test in staging, prepare rollback |
| **2** | Test migration (bulk data, integrity) | 2 | W1 Thu | W1 Fri | Validate all FKs, counts, samples |
| **3** | Create CatalogItemController | 2 | W2 Mon | W2 Mon | Unified CRUD + transformations |
| **3** | Update routes + auth | 1 | W2 Mon | W2 Tue | Remove old endpoints (optional) |
| **3** | API documentation + testing | 1 | W2 Tue | W2 Tue | Postman, response samples |
| **4** | Update frontend API service | 2 | W2 Wed | W2 Wed | getCatalogItems(), remove legacy calls |
| **4** | Consolidate admin UX | 2 | W2 Thu | W2 Fri | Single CatalogManagementPage |
| **4** | Consolidate customer UX | 1 | W2 Fri | W3 Mon | Update CatalogPage |
| **5** | Remove legacy tables (if confident) | 1 | W3 Tue | W3 Tue | After 2-week grace period |
| **Total** | | **19** | | | ~1.5 weeks if full-time |

---

## Part 9: Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Data loss during migration | Low | Critical | Backup + dry-run in staging + rollback script |
| FK constraint failures | Medium | High | Validate data integrity before, during, after |
| API client breakage | Medium | High | Deprecation phase (2-4 weeks) + 301 redirects |
| Frontend regression | Medium | Medium | Type-aware component testing + QA |
| Warranty/Serial query performance regresses | Low | Medium | Index analysis + query optimization pre-release |
| Incomplete legacy data mapping | Low | High | Audit script comparing counts row-by-row |

---

## Part 10: Conclusion

This redesign **eliminates 3000+ lines of duplicate code**, **reduces complexity for future product/service types**, and **establishes a single source of truth for all inventory**. The phased approach ensures minimal disruption while providing a clear rollback path at each stage.

**Next Steps:**
1. Review this design with team
2. Finalize schema (adjust based on feedback)
3. Begin Phase 1 (schema creation)
4. Proceed with data migration in staging environment
5. Coordinate production cutover

---

*Document created: March 31, 2026*  
*Prepared by: Architectural Redesign Task*
