# Vehicle Fitment CSV Import

Use this command to import larger fitment catalogs without editing seeders.

## Command

```bash
php artisan fitment:import-csv storage/app/fitments.csv --market=AU
```

## Required CSV Columns

- market (optional if `--market` is provided)
- make
- model
- variant
- year_from
- year_to
- state_code
- fuel_type
- body_type
- drivetrain
- notes
- primary_sku
- alternate_sku

## Example Row

```csv
market,make,model,variant,year_from,year_to,state_code,fuel_type,body_type,drivetrain,notes,primary_sku,alternate_sku
AU,TOYOTA,HILUX,2.8D,2017,2025,,Diesel,Ute,4x4,Importer batch 2026-03,MF95D31R,MF95D31L
```

## Notes

- SKU values must exist in `battery_models`.
- Unknown SKUs are skipped with a warning.
- Existing fitments are matched by market/make/model/variant/year range.
- Recommendations are de-duplicated by fitment + battery + recommendation type.
