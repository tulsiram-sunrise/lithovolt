# Asset Design Briefs & Production Guide

**Project**: Lithovolt Battery Manager  
**Brand**: Lithovolt  
**Version**: 1.0.0  
**Created**: February 19, 2026

---

## 🎨 Brand Guidelines

### Color Palette

**Primary Colors**:
```
Purple Primary:   #667eea  (RGB: 102, 126, 234)
Purple Secondary: #764ba2  (RGB: 118, 75, 162)
```

**Accent Colors**:
```
Success Green:    #4caf50  (RGB: 76, 175, 80)
Error Red:        #f44336  (RGB: 244, 67, 54)
Warning Orange:   #ff9800  (RGB: 255, 152, 0)
Info Blue:        #2196f3  (RGB: 33, 150, 243)
```

**Neutral Colors**:
```
White:            #ffffff
Light Gray:       #f5f5f5
Medium Gray:      #9e9e9e
Dark Gray:        #333333
Black:            #000000
```

**Gradients**:
```css
Primary Gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
Hero Gradient:    linear-gradient(180deg, #667eea 0%, #764ba2 50%, #5a3d8a 100%)
```

### Typography

**Primary Font**: **Segoe UI** (Windows) / **SF Pro** (iOS) / **Roboto** (Android)  
**Alternative**: **Inter**, **Open Sans**, **Helvetica Neue**

**Font Weights**:
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

**Heading Sizes**:
```
H1: 32-48px, Bold
H2: 24-32px, Semibold
H3: 20-24px, Semibold
H4: 18-20px, Medium
Body: 16px, Regular
Caption: 14px, Regular
Small: 12px, Regular
```

### Logo Elements

**Primary Logo**: "LITHOVOLT" text with lightning bolt (⚡) symbol  
**Icon Symbol**: Lightning bolt inside battery outline  
**Tagline**: "Power You Can Trust" (optional)

---

## 📱 App Icon Design Brief

### Concept

**Visual Elements**:
1. **Lightning Bolt** (⚡) - Represents energy, power, speed
2. **Battery Outline** - Core product focus
3. **Purple Gradient** - Brand identity
4. **Modern & Minimal** - Clean, professional aesthetic

### Design Options

#### Option A: Lightning + Battery (Recommended)
```
┌─────────────────────┐
│                     │
│   ╔═══════════╗    │
│   ║  ╭─╮      ║    │  Battery outline
│   ║  │ │  ⚡   ║    │  with lightning inside
│   ║  ╰─╯      ║    │  Purple gradient BG
│   ╚═══════════╝    │
│                     │
└─────────────────────┘
```

**Pros**: Immediately communicates "battery power/management"  
**Cons**: May be cluttered at small sizes

---

#### Option B: Minimalist Lightning (Clean)
```
┌─────────────────────┐
│                     │
│                     │
│        ⚡           │  Large lightning bolt
│                     │  Centered, bold
│                     │  Gradient background
│                     │
└─────────────────────┘
```

**Pros**: Simple, scalable, recognizable  
**Cons**: Less specific to battery industry

---

#### Option C: Abstract L + Battery
```
┌─────────────────────┐
│                     │
│   ╔═══╗             │
│   ║ L ║  ⚡         │  "L" shaped battery
│   ║   ║             │  with lightning
│   ╚═══╝             │  Creative + meaningful
│                     │
└─────────────────────┘
```

**Pros**: Unique, memorable brand mark  
**Cons**: Requires explanation / brand building

---

#### Option D: Badge Style (Professional)
```
┌─────────────────────┐
│    ╭─────────╮      │
│   │  ⚡       │     │  Shield/badge shape
│   │ LITHO    │     │  Lightning at top
│   │  VOLT    │     │  Text inside (small)
│    ╰─────────╯      │  Professional look
│                     │
└─────────────────────┘
```

**Pros**: Professional, trustworthy appearance  
**Cons**: Text may not be readable at small sizes

---

**Recommendation**: **Option B (Minimalist Lightning)** for maximum versatility and scalability

### Technical Specifications

**Sizes Required**:
- 1024 x 1024 px (iOS App Store, high quality)
- 512 x 512 px (Android Play Store)
- No transparency (solid background)
- RGB color mode
- PNG or JPEG format

**Safe Zone**:
- Keep main symbol in center 80% of canvas
- Avoid fine details (1-2px lines won't render well)
- Test at 64x64px to ensure recognizability

**Adaptive Icon** (Android):
- Foreground layer: 432 x 432 px (center 66% safe zone)
- Background layer: 432 x 432 px (full canvas)
- Can be gradient or solid color

### Design Tools & Resources

**Recommended Tools**:
1. **Figma** (Free, web-based) - Best for collaboration
2. **Adobe Illustrator** (Paid) - Best for vector precision
3. **Sketch** (Mac only, paid) - Popular among app designers
4. **Canva** (Freemium) - Easy templates

**Icon Template Resources**:
- [iOS Icon Templates](https://developer.apple.com/design/resources/)
- [Material Design Icon Templates](https://material.io/design/iconography/)
- [Figma App Icon Templates](https://www.figma.com/community/search?resource_type=mixed&sort_by=relevancy&query=app%20icon&editor_type=all)

### Color Application

**Background**: Purple gradient (#667eea → #764ba2)  
**Symbol Color**: White (#ffffff) or light purple (#e1d5f7)  
**Outline/Stroke**: Darker purple (#5a3d8a) for contrast

**Avoid**:
- Multiple gradients (one is enough)
- Too many colors (limit to 2-3)
- Text in icon (hard to read at small sizes)

---

## 🖼️ Feature Graphic Design Brief (Android)

### Concept

**Purpose**: Large banner image displayed at top of Play Store listing

**Dimensions**: 1024 x 500 pixels (exact)

### Layout Structure

```
┌────────────────────────────────────────────────────────────────┐
│ [40px margin]                                                  │
│                                                                │
│   [Icon/Symbol]     LITHOVOLT                      [Device/   │
│        ⚡           Battery Manager                  QR Code]  │
│                                                                │
│   • Track Inventory    • Manage Warranties    • Verify QR     │
│                                                                │
│ [40px margin]                                                  │
└────────────────────────────────────────────────────────────────┘
     20% width            40% width                    40% width
```

### Content Sections

**Left (20%)**:
- App icon or lightning bolt symbol
- Size: ~200px height
- Centered vertically

**Center (40%)**:
- App name: "LITHOVOLT" (48-60px, bold)
- Subtitle: "Battery Manager" (24-32px, regular)
- Stacked vertically, centered

**Right (40%)**:
- Phone mockup with QR scanner screen OR
- Large QR code sample OR
- Battery illustration

**Bottom**:
- 3 key features with bullet points
- Small icons next to each feature (optional)
- 18-20px font size

### Color Scheme

**Background**: Purple gradient (primary gradient)  
**Text**: White (#ffffff) for maximum contrast  
**Accents**: Light purple or white symbols

### Design Guidelines

**Do's**:
- Use high-resolution images (2x retina quality)
- Ensure text is readable at thumbnail size
- Maintain brand colors and style
- Show actual app UI if possible
- Keep design clean and uncluttered

**Don'ts**:
- Don't use busy backgrounds
- Don't include too much text
- Don't use low-res images
- Don't copy competitor designs
- Don't include device with notch (dates quickly)

### Export Settings

- Format: PNG (preferred) or JPEG
- Dimensions: Exactly 1024 x 500 px
- Color mode: RGB
- File size: Under 1MB
- Resolution: 72 DPI minimum

---

## 📸 Screenshot Design Briefs

### Overall Style: "Floating UI"

**Concept**: App screenshots with minimal device frame, text overlays, and branded background

### Template Layout

```
┌──────────────────────────────────────────────────┐
│ [Margin: 60px]                                   │
│                                                  │
│  [HEADLINE - Bold, 60-72px]                      │
│  [Subtext - Regular, 28-36px]                    │
│                                                  │
│  [Margin: 40px]                                  │
│                                                  │
│    ╔══════════════════════════╗                 │
│    ║                          ║                 │
│    ║   Actual App Screenshot  ║  [Phone mockup] │
│    ║   (rounded corners,      ║  [with subtle]  │
│    ║   subtle box shadow)     ║  [shadow]       │
│    ║                          ║                 │
│    ║                          ║                 │
│    ╚══════════════════════════╝                 │
│                                                  │
│  [Optional bullet points or icons]               │
│                                                  │
│ [Margin: 60px]                                   │
└──────────────────────────────────────────────────┘
```

### Color Coding by Screenshot Type

**Login/Security**: Blue gradient background  
**Dashboard/Analytics**: Purple gradient (primary)  
**QR Scanner**: Green gradient (success theme)  
**Inventory/Orders**: Orange gradient (warm, active)  
**Warranty/Certificates**: Purple gradient (primary)

### Individual Screenshot Briefs

---

#### Screenshot 1: Login/OTP Screen

**Headline**: "Secure Access with One-Time Password"  
**Subtext**: "Enterprise-grade security for your business"  
**Background**: Blue-purple gradient  
**Screenshot Content**:
- Phone number input field
- OTP code boxes (6 digits)
- Lock/shield icon
- "Login" button

**Key Message**: Security and professionalism

---

#### Screenshot 2: Wholesaler Dashboard

**Headline**: "Manage Your Business at a Glance"  
**Subtext**: "Real-time inventory, orders, and sales analytics"  
**Background**: Purple gradient (primary brand)  
**Screenshot Content**:
- 3 metric cards (Total Inventory, Pending Orders, Active Warranties)
- Line chart showing sales trend
- Recent activity list
- Quick action buttons

**Key Message**: Comprehensive management tools

---

#### Screenshot 3: QR Code Scanner

**Headline**: "Instant Battery Verification"  
**Subtext**: "Scan QR codes to verify authenticity in seconds"  
**Background**: Green gradient (success)  
**Screenshot Content**:
- Camera viewfinder with QR code
- Targeting reticle/frame
- "Scanning..." or "Verified ✓" message
- Battery details preview

**Key Message**: Core anti-counterfeiting feature

---

#### Screenshot 4: Inventory List

**Headline**: "Track Every Single Battery"  
**Subtext**: "Complete visibility of models, serial numbers, and stock"  
**Background**: Orange-purple gradient  
**Screenshot Content**:
- Battery model cards with images
- Stock quantities displayed
- Filter/search bar at top
- "Add New" floating action button

**Key Message**: Powerful inventory management

---

#### Screenshot 5: Warranty Issuance Form

**Headline**: "Issue Warranties in Seconds"  
**Subtext**: "Digital certificates generated automatically with QR codes"  
**Background**: Purple gradient  
**Screenshot Content**:
- Customer details form (name, phone, email)
- Battery selection dropdown
- Serial number field
- "Generate Warranty" button

**Key Message**: Streamlined workflow

---

#### Screenshot 6: Warranty Certificate

**Headline**: "Professional Digital Certificates"  
**Subtext**: "Downloadable PDF warranties with QR verification"  
**Background**: White or light gradient  
**Screenshot Content**:
- Warranty certificate displayed
- Lithovolt branding header
- QR code visible
- Battery details (model, serial, date)
- Consumer information
- Download/Share buttons

**Key Message**: Professional output

---

#### Screenshot 7: Order Management

**Headline**: "Simplified Order Placement"  
**Subtext**: "Track orders with real-time status updates"  
**Background**: Blue-purple gradient  
**Screenshot Content**:
- Product selection interface
- Quantity selectors
- Order summary card
- "Place Order" button
- Or order tracking list with status badges

**Key Message**: Easy ordering

---

#### Screenshot 8: Notifications

**Headline**: "Stay Updated Instantly"  
**Subtext**: "Real-time alerts for orders, warranties, and inventory"  
**Background**: Purple gradient  
**Screenshot Content**:
- Notification list
- Different notification types (order, warranty, alert)
- Time stamps
- Unread indicators
- Icons for each notification type

**Key Message**: Never miss important updates

---

### Screenshot Production Workflow

1. **Capture Base Screenshots**
   - Run app on device/simulator
   - Use realistic data (not Lorem Ipsum)
   - Ensure UI is pixel-perfect
   - Hide device status bar (optional)

2. **Create Mockup in Design Tool**
   - Import screenshot
   - Apply device frame (optional) or use floating style
   - Add rounded corners (16-24px radius)
   - Add subtle box shadow

3. **Add Background**
   - Apply gradient or solid color
   - Ensure sufficient contrast with screenshot

4. **Add Text Overlays**
   - Headline at top (bold, large)
   - Subtext below headline (regular, smaller)
   - Ensure readability at thumbnail size

5. **Final Polish**
   - Check alignment and spacing
   - Test at small sizes
   - Export at exact dimensions
   - Optimize file size

6. **Quality Check**
   - View at thumbnail size (200px wide)
   - Check text readability
   - Verify colors match brand
   - Ensure no sensitive data visible

---

## 🎬 App Preview Video Script (Optional)

### Video Specifications

**Duration**: 15-30 seconds  
**Resolution**: 1080p (1920x1080) minimum  
**Aspect Ratio**: 16:9 (horizontal) or 9:16 (vertical)  
**Format**: MP4 or MOV  
**File Size**: Under 500MB  
**Frame Rate**: 30 fps or 60 fps

### Storyboard

#### Scene 1 (0-3 seconds)
**Visual**: Lithovolt logo animation on gradient background  
**Text Overlay**: "LITHOVOLT Battery Manager"  
**Audio**: Upbeat music starts

#### Scene 2 (3-8 seconds)
**Visual**: Hand holding phone, scanning QR code on battery  
**Text Overlay**: "Scan any battery instantly"  
**Animation**: QR code detected, checkmark appears

#### Scene 3 (8-13 seconds)
**Visual**: Dashboard screen with animated statistics  
**Text Overlay**: "Manage inventory in real-time"  
**Animation**: Numbers counting up, chart animating

#### Scene 4 (13-18 seconds)
**Visual**: Warranty certificate generation  
**Text Overlay**: "Generate warranties with one tap"  
**Animation**: Certificate appears, QR code populates

#### Scene 5 (18-23 seconds)
**Visual**: Order placement interface  
**Text Overlay**: "Place and track orders seamlessly"  
**Animation**: Order placed with success animation

#### Scene 6 (23-28 seconds)
**Visual**: App icon with download buttons  
**Text Overlay**: "Download Lithovolt Today"  
**Animation**: App Store and Play Store badges appear

#### Scene 7 (28-30 seconds)
**Visual**: Hold on app icon with URL  
**Text Overlay**: "lithovolt.com"  
**Audio**: Music fades out

### Production Notes

**Filming Tips**:
- Use high-quality screen recording software
- Record in highest resolution possible
- Use consistent lighting if showing hands/physical products
- Keep camera steady (use tripod)

**Editing Tips**:
- Use smooth transitions (fade, slide)
- Keep text on screen for 2-3 seconds minimum
- Match music beats to scene changes
- Add subtle sound effects for interactions
- Color grade for consistency

**Voiceover** (Optional):
"Lithovolt Battery Manager - the complete solution for warranty management, inventory tracking, and QR verification. Available now on iOS and Android."

---

## 🌐 Marketing Materials

### Social Media Posts

#### Post 1: Launch Announcement
**Platforms**: LinkedIn, Twitter, Facebook, Instagram  
**Image**: App icon + key screenshot composite  
**Copy**:
```
🔋⚡ Introducing Lithovolt Battery Manager!

Track inventory, manage warranties, and verify authenticity—all in one powerful app.

✅ Real-time inventory tracking
✅ Digital warranty certificates
✅ QR code verification
✅ Seamless order management

Download now:
📱 iOS: [App Store Link]
📱 Android: [Play Store Link]

#BatteryManagement #WarrantyTracking #BusinessTech #Lithovolt
```

#### Post 2: Feature Highlight (QR Scanning)
**Image**: Screenshot of QR scanner in action  
**Copy**:
```
🔍 Verify battery authenticity in seconds!

Our advanced QR scanning technology ensures you're always dealing with genuine products. Perfect for wholesalers, retailers, and consumers.

Learn more: lithovolt.com
```

#### Post 3: Use Case (Wholesalers)
**Image**: Dashboard screenshot  
**Copy**:
```
📊 Wholesalers: Manage your battery business smarter!

With Lithovolt Battery Manager:
• Track all inventory in real-time
• Allocate stock effortlessly
• Issue warranties digitally
• Fulfill orders faster

Transform your operations today. Download link in bio.
```

### Email Newsletter Template

**Subject**: "Introducing Lithovolt Battery Manager - Now Available!"

**Body**:
```
Hi [Name],

We're excited to announce the launch of Lithovolt Battery Manager—your complete solution for battery inventory, warranty management, and verification.

🎯 What's Inside:

For Wholesalers & Retailers:
✓ Real-time inventory dashboard
✓ Quick QR code scanning
✓ Digital warranty issuance
✓  Order tracking & fulfillment

For Consumers:
✓ Warranty registration via QR scan
✓ Digital certificate downloads
✓ Service center locator
✓ Warranty claim submission

🚀 Download Now:
[iOS App Store Button]
[Google Play Button]

Have questions? Reply to this email or visit our support page.

Best regards,
The Lithovolt Team

---
Lithovolt Inc. | lithovolt.com | support@lithovolt.com
```

### Website Banner

**Dimensions**: 1920 x 400 pixels  
**Content**:
- Background: Purple gradient
- Left: App icon + "Now Available"
- Center: "Lithovolt Battery Manager" headline
- Right: Download buttons (iOS + Android)

---

## 📋 Asset Production Checklist

### Design Assets
- [ ] App icon (1024x1024 for iOS)
- [ ] App icon (512x512 for Android)
- [ ] Adaptive icon layers (Android)
- [ ] Feature graphic (1024x500 for Android)
- [ ] 8 screenshots (iOS 6.5" display)
- [ ] 8 screenshots (iOS 5.5" display)
- [ ] 8 screenshots (Android portrait)
- [ ] Optional: iPad screenshots
- [ ] Optional: App preview video (15-30s)

### Marketing Materials
- [ ] Social media announcement graphics
- [ ] Email newsletter template
- [ ] Website banner/hero image
- [ ] Press kit assets
- [ ] Logo variations (color, white, black)

### Documentation
- [ ] Brand guidelines PDF
- [ ] Asset usage guidelines
- [ ] Screenshot captions document
- [ ] Video script and storyboard

---

## 🎓 Design Best Practices

### Do's ✅
- Maintain consistent brand colors across all assets
- Use high-resolution images (2x or 3x for retina displays)
- Test all assets at their intended display sizes
- Keep designs simple and focused
- Use readable fonts at all sizes
- Ensure sufficient color contrast
- Follow platform-specific guidelines

### Don'ts ❌
- Don't use pixelated or low-quality images
- Don't include outdated UI in screenshots
- Don't use too many colors or fonts
- Don't copy competitor designs
- Don't include personal or sensitive information
- Don't use stock photos that look generic
- Don't forget to export in correct formats

---

## 📞 Design Support

**Questions about assets?**

Contact:
- Design Lead: design@lithovolt.com
- Marketing Team: marketing@lithovolt.com

**External Resources**:
- [Apple Design Resources](https://developer.apple.com/design/resources/)
- [Material Design Guidelines](https://material.io/design)
- [Figma Community](https://www.figma.com/community)
- [Dribbble for Inspiration](https://dribbble.com/tags/app-store-screenshots)

---

**Document Version**: 1.0  
**Last Updated**: February 19, 2026  
**Next Review**: After initial asset creation

**Ready to create amazing assets! 🎨📱**
