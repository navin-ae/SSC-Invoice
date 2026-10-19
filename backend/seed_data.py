import os
import sys

# Ensure backend root in path
pkg_dir = os.path.dirname(os.path.abspath(__file__))
if pkg_dir not in sys.path:
    sys.path.insert(0, pkg_dir)

from app import database, models

# Group IDs from existing database
RETAIL_GROUP_ID = "4521955586932360112"
WHOLESALE_GROUP_ID = "6434112410486981295"

# Ensure tables are created
models.Base.metadata.create_all(bind=database.engine)
db = database.SessionLocal()

# List of 124 realistic products
products_data = [
    # --- Stationery (Pencils, Pens, Erasers, Sharpeners, Scales) ---
    {"name": "Apsara Platinum Extra Dark Pencils (Pack of 10)", "hsn": "9609", "gst_rate": 0, "r": 60, "w": 48},
    {"name": "Apsara Matt Magic Pencils (Pack of 10)", "hsn": "9609", "gst_rate": 0, "r": 70, "w": 56},
    {"name": "Apsara Beauty Dark Pencils (Pack of 10)", "hsn": "9609", "gst_rate": 0, "r": 50, "w": 40},
    {"name": "Apsara Non-Dust Eraser Jumbo (Pack of 20)", "hsn": "4016", "gst_rate": 18, "r": 100, "w": 80},
    {"name": "Apsara Long Point Sharpener (Box of 20)", "hsn": "8214", "gst_rate": 12, "r": 100, "w": 78},
    {"name": "Apsara 15cm Clear Plastic Scale (Pack of 10)", "hsn": "9017", "gst_rate": 18, "r": 50, "w": 38},
    {"name": "Apsara 30cm Clear Plastic Scale", "hsn": "9017", "gst_rate": 18, "r": 15, "w": 11},
    {"name": "Nataraj 621 Bold Pencils (Pack of 10)", "hsn": "9609", "gst_rate": 0, "r": 50, "w": 40},
    {"name": "Nataraj Classic Eraser (Box of 30)", "hsn": "4016", "gst_rate": 18, "r": 90, "w": 70},
    {"name": "Nataraj Red & Blue Checking Pencil", "hsn": "9609", "gst_rate": 0, "r": 10, "w": 7.5},
    {"name": "Nataraj Geometric Compass & Divider Set", "hsn": "9017", "gst_rate": 18, "r": 45, "w": 35},
    {"name": "Doms Groove Triangle Pencils (Pack of 10)", "hsn": "9609", "gst_rate": 0, "r": 70, "w": 55},
    {"name": "Doms Neon Rubber Tipped Pencils (Pack of 10)", "hsn": "9609", "gst_rate": 0, "r": 60, "w": 48},
    {"name": "Doms Oil Pastels 25 Shades Plastic Case", "hsn": "9609", "gst_rate": 12, "r": 130, "w": 105},
    {"name": "Doms Plastic Crayons 12 Shades", "hsn": "9609", "gst_rate": 12, "r": 50, "w": 40},
    {"name": "Doms Water Color Tubes 12 Shades", "hsn": "3213", "gst_rate": 12, "r": 90, "w": 72},
    {"name": "Doms Mathematical Drawing Instruments Box", "hsn": "9017", "gst_rate": 18, "r": 120, "w": 95},
    {"name": "Doms Dust-Free Eraser (Jar of 30)", "hsn": "4016", "gst_rate": 18, "r": 150, "w": 115},
    {"name": "Camlin Kokuyo Whiteboard Marker - Black", "hsn": "9608", "gst_rate": 18, "r": 35, "w": 26},
    {"name": "Camlin Kokuyo Whiteboard Marker - Blue", "hsn": "9608", "gst_rate": 18, "r": 35, "w": 26},
    {"name": "Camlin Kokuyo Whiteboard Marker - Red", "hsn": "9608", "gst_rate": 18, "r": 35, "w": 26},
    {"name": "Camlin Kokuyo Whiteboard Marker - Green", "hsn": "9608", "gst_rate": 18, "r": 35, "w": 26},
    {"name": "Camlin Permanent Marker Pen - Black", "hsn": "9608", "gst_rate": 18, "r": 30, "w": 22},
    {"name": "Camlin Permanent Marker Pen - Blue", "hsn": "9608", "gst_rate": 18, "r": 30, "w": 22},
    {"name": "Camlin Scholar Geometry Box", "hsn": "9017", "gst_rate": 18, "r": 110, "w": 88},
    {"name": "Camlin Student Water Color Cakes 24 Shades", "hsn": "3213", "gst_rate": 12, "r": 95, "w": 76},
    {"name": "Camlin Exam Writing Board (Transparent Acrylic)", "hsn": "3926", "gst_rate": 18, "r": 90, "w": 70},
    {"name": "Camlin Whiteboard Duster with Marker Holder", "hsn": "9603", "gst_rate": 18, "r": 45, "w": 34},

    # --- Notebooks, Papers & Registers ---
    {"name": "Classmate Long Notebook 192 Pages Single Line", "hsn": "4820", "gst_rate": 12, "r": 65, "w": 52},
    {"name": "Classmate Long Notebook 192 Pages Unruled", "hsn": "4820", "gst_rate": 12, "r": 65, "w": 52},
    {"name": "Classmate Long Notebook 140 Pages Single Line", "hsn": "4820", "gst_rate": 12, "r": 50, "w": 40},
    {"name": "Classmate King Size 172 Pages Four Line", "hsn": "4820", "gst_rate": 12, "r": 55, "w": 44},
    {"name": "Classmate King Size 172 Pages Maths Square", "hsn": "4820", "gst_rate": 12, "r": 55, "w": 44},
    {"name": "Classmate Drawing Book 40 Pages A4", "hsn": "4820", "gst_rate": 12, "r": 45, "w": 36},
    {"name": "Classmate Pulse Spiral Notebook A4 300 Pages (6 Subject)", "hsn": "4820", "gst_rate": 12, "r": 180, "w": 145},
    {"name": "Navneet Graph Book 32 Pages (2mm Grid)", "hsn": "4820", "gst_rate": 12, "r": 30, "w": 23},
    {"name": "Navneet Science Practical Record Book A4 120 Pages", "hsn": "4820", "gst_rate": 12, "r": 95, "w": 74},
    {"name": "JK Copier A4 Paper 75 GSM (1 Ream - 500 Sheets)", "hsn": "4802", "gst_rate": 12, "r": 320, "w": 275},
    {"name": "JK Cedar A4 Paper 70 GSM (1 Ream - 500 Sheets)", "hsn": "4802", "gst_rate": 12, "r": 290, "w": 250},
    {"name": "TNPL Copier A4 Paper 75 GSM (1 Ream - 500 Sheets)", "hsn": "4802", "gst_rate": 12, "r": 310, "w": 265},
    {"name": "TNPL Legal Size Copier Paper 75 GSM (1 Ream)", "hsn": "4802", "gst_rate": 12, "r": 390, "w": 335},

    # --- Pens (Ball, Gel, Roller, Highlighters) ---
    {"name": "Reynolds 045 Fine Carbure Ball Pen - Blue", "hsn": "9608", "gst_rate": 18, "r": 10, "w": 7.5},
    {"name": "Reynolds 045 Fine Carbure Ball Pen - Black", "hsn": "9608", "gst_rate": 18, "r": 10, "w": 7.5},
    {"name": "Reynolds 045 Fine Carbure Ball Pen - Red", "hsn": "9608", "gst_rate": 18, "r": 10, "w": 7.5},
    {"name": "Reynolds Trimax Liquid Gel Pen - Blue", "hsn": "9608", "gst_rate": 18, "r": 60, "w": 48},
    {"name": "Reynolds Trimax Refill - Blue", "hsn": "9608", "gst_rate": 18, "r": 25, "w": 20},
    {"name": "Reynolds Jetter Classic Ball Pen - Blue", "hsn": "9608", "gst_rate": 18, "r": 40, "w": 32},
    {"name": "Cello Butterflow Classic Ball Pen - Blue (Pack of 5)", "hsn": "9608", "gst_rate": 18, "r": 50, "w": 38},
    {"name": "Cello Butterflow Classic Ball Pen - Black (Pack of 5)", "hsn": "9608", "gst_rate": 18, "r": 50, "w": 38},
    {"name": "Cello Gripper Ball Pen - Blue", "hsn": "9608", "gst_rate": 18, "r": 15, "w": 11.5},
    {"name": "Cello Maxwriter Ball Pen - Blue", "hsn": "9608", "gst_rate": 18, "r": 12, "w": 9},
    {"name": "Cello Deco Gel Pen 0.5mm - Blue", "hsn": "9608", "gst_rate": 18, "r": 20, "w": 15},
    {"name": "Cello Whiter Liquid Correction Pen (Whitener)", "hsn": "3824", "gst_rate": 18, "r": 35, "w": 27},
    {"name": "Faber-Castell Connector Sketch Pens 25 Shades", "hsn": "9608", "gst_rate": 18, "r": 140, "w": 112},
    {"name": "Faber-Castell Bi-Color Pencils 12 Pack (24 Colors)", "hsn": "9609", "gst_rate": 12, "r": 120, "w": 95},
    {"name": "Faber-Castell Highlighters Assorted (Wallet of 5)", "hsn": "9608", "gst_rate": 18, "r": 125, "w": 98},
    {"name": "Faber-Castell Correction Tape 5mm x 6m", "hsn": "9612", "gst_rate": 18, "r": 60, "w": 46},
    {"name": "Luxor Textliter Fluorescent Highlighter - Yellow", "hsn": "9608", "gst_rate": 18, "r": 25, "w": 19},
    {"name": "Luxor Textliter Fluorescent Highlighter - Green", "hsn": "9608", "gst_rate": 18, "r": 25, "w": 19},
    {"name": "Luxor Textliter Fluorescent Highlighter - Pink", "hsn": "9608", "gst_rate": 18, "r": 25, "w": 19},
    {"name": "Luxor CD/DVD Permanent Marker Pen", "hsn": "9608", "gst_rate": 18, "r": 25, "w": 19},
    {"name": "Pilot Hi-Techpoint 05 Rollerball Pen - Blue", "hsn": "9608", "gst_rate": 18, "r": 55, "w": 44},
    {"name": "Pilot Hi-Techpoint 05 Rollerball Pen - Black", "hsn": "9608", "gst_rate": 18, "r": 55, "w": 44},
    {"name": "Pilot V7 Hi-Grip Liquid Ink Pen - Blue", "hsn": "9608", "gst_rate": 18, "r": 70, "w": 56},

    # --- Desk Supplies, Staplers, Adhesives & Files ---
    {"name": "Kangaro No. 10 Stapler (Mini Pocket)", "hsn": "8472", "gst_rate": 18, "r": 55, "w": 42},
    {"name": "Kangaro No. 10 Stapler Pins (Box of 1000)", "hsn": "8305", "gst_rate": 18, "r": 12, "w": 8.5},
    {"name": "Kangaro 24/6 Heavy Duty Stapler (HP-45)", "hsn": "8472", "gst_rate": 18, "r": 190, "w": 152},
    {"name": "Kangaro 24/6 Stapler Pins (Box of 1000)", "hsn": "8305", "gst_rate": 18, "r": 25, "w": 19},
    {"name": "Kangaro 2-Hole Paper Puncher (DP-600)", "hsn": "8472", "gst_rate": 18, "r": 160, "w": 128},
    {"name": "Kangaro Single Hole Puncher (DP-52)", "hsn": "8472", "gst_rate": 18, "r": 85, "w": 68},
    {"name": "Kangaro Staple Pin Remover (SR-500)", "hsn": "8472", "gst_rate": 18, "r": 40, "w": 30},
    {"name": "Fevicol MR Squeeze Bottle 100g", "hsn": "3506", "gst_rate": 18, "r": 45, "w": 36},
    {"name": "Fevicol MR Squeeze Bottle 200g", "hsn": "3506", "gst_rate": 18, "r": 80, "w": 64},
    {"name": "Fevicol MR Squeeze Bottle 50g", "hsn": "3506", "gst_rate": 18, "r": 25, "w": 20},
    {"name": "Fevistik Super Glue Stick 8g", "hsn": "3506", "gst_rate": 18, "r": 20, "w": 15},
    {"name": "Fevistik Super Glue Stick 15g", "hsn": "3506", "gst_rate": 18, "r": 35, "w": 27},
    {"name": "Fevistik Super Glue Stick 25g", "hsn": "3506", "gst_rate": 18, "r": 55, "w": 42},
    {"name": "Fevikwik Instant Adhesive 3g", "hsn": "3506", "gst_rate": 18, "r": 10, "w": 8},
    {"name": "Oddy Sticky Notes 3x3 Inch Yellow (100 Sheets)", "hsn": "4820", "gst_rate": 12, "r": 45, "w": 33},
    {"name": "Oddy Neon Sticky Notes 3x3 Multi-Color", "hsn": "4820", "gst_rate": 12, "r": 60, "w": 45},
    {"name": "Oddy Page Marker Index Flags (5 Colors)", "hsn": "3919", "gst_rate": 18, "r": 40, "w": 29},
    {"name": "Kores Sapphire Carbon Paper Blue (100 Sheets)", "hsn": "4816", "gst_rate": 18, "r": 140, "w": 110},
    {"name": "Kores Stamp Pad Medium No. 2 Blue", "hsn": "9612", "gst_rate": 18, "r": 60, "w": 46},
    {"name": "Kores Stamp Pad Ink Blue 30ml", "hsn": "3215", "gst_rate": 18, "r": 35, "w": 26},
    {"name": "Solo Clear Presentation File Folder A4", "hsn": "3926", "gst_rate": 18, "r": 30, "w": 22},
    {"name": "Solo Cobra Spring File Deluxe Board", "hsn": "4820", "gst_rate": 12, "r": 45, "w": 34},
    {"name": "Solo Box File Heavy Duty Lever Arch A4", "hsn": "4820", "gst_rate": 12, "r": 120, "w": 92},
    {"name": "Munix Stationery Scissor 6.5 Inch", "hsn": "8213", "gst_rate": 18, "r": 85, "w": 65},
    {"name": "Munix Craft Paper Cutter Knife Small", "hsn": "8211", "gst_rate": 18, "r": 25, "w": 18},
    {"name": "Munix Heavy Duty Blade Cutter Large (18mm)", "hsn": "8211", "gst_rate": 18, "r": 65, "w": 48},
    {"name": "Wonder Cello Tape 1 Inch Transparent (65m)", "hsn": "3919", "gst_rate": 18, "r": 30, "w": 22},
    {"name": "Wonder Brown Packaging Tape 2 Inch (65m)", "hsn": "3919", "gst_rate": 18, "r": 60, "w": 45},
    {"name": "Wonder Double Sided Foam Tape 1 Inch (3m)", "hsn": "3919", "gst_rate": 18, "r": 50, "w": 38},
    {"name": "Brown Craft Paper Roll for Book Covering (5 Meters)", "hsn": "4804", "gst_rate": 12, "r": 35, "w": 25},
    {"name": "Transparent Book Covering Plastic Roll (10 Meters)", "hsn": "3920", "gst_rate": 18, "r": 75, "w": 55},
    {"name": "Student Name Label Stickers (Pack of 10 Sheets - 80 Labels)", "hsn": "4821", "gst_rate": 12, "r": 25, "w": 16},
    {"name": "Camel Art Contest Poster Colors 12 Shades", "hsn": "3213", "gst_rate": 12, "r": 150, "w": 120},
    {"name": "Camel Painting Brush Set (Round 1 to 6)", "hsn": "9603", "gst_rate": 18, "r": 95, "w": 75},

    # --- General Merchants / Fancy Goods / Cosmetics / Plastics ---
    {"name": "Color Chart Paper Full Sheet (Pack of 10 Assorted Colors)", "hsn": "4802", "gst_rate": 12, "r": 70, "w": 52},
    {"name": "Fluorescent Neon Chart Paper Full Sheet - Yellow/Green", "hsn": "4802", "gst_rate": 12, "r": 12, "w": 8.5},
    {"name": "Glitter Foam Sheets A4 Multi-Color (Pack of 10)", "hsn": "3921", "gst_rate": 18, "r": 90, "w": 68},
    {"name": "Handheld Oval Dressing Mirror with Plastic Handle (8 Inch)", "hsn": "7009", "gst_rate": 18, "r": 65, "w": 48},
    {"name": "Pocket Compact Folding Mirror Double Sided (Square)", "hsn": "7009", "gst_rate": 18, "r": 35, "w": 25},
    {"name": "Wall Hanging Decorative Framed Mirror 10x14 Inch", "hsn": "7009", "gst_rate": 18, "r": 180, "w": 135},
    {"name": "Stainless Steel Heavy Duty Nail Clipper Large with Catcher", "hsn": "8214", "gst_rate": 18, "r": 55, "w": 38},
    {"name": "Wide Tooth Plastic Hair Comb Black (Pack of 3)", "hsn": "9615", "gst_rate": 18, "r": 40, "w": 26},
    {"name": "Garnier Color Naturals Creme Hair Color Sachet - 1 Natural Black", "hsn": "3305", "gst_rate": 18, "r": 50, "w": 42},
    {"name": "Pond's Dreamflower Fragrant Talcum Powder 100g", "hsn": "3304", "gst_rate": 18, "r": 95, "w": 80},
    {"name": "Vaseline Total Moisture Body Lotion 100ml", "hsn": "3304", "gst_rate": 18, "r": 110, "w": 92},
    {"name": "Godrej No. 1 Grade-1 Sandal Soap (Pack of 4x100g)", "hsn": "3401", "gst_rate": 18, "r": 120, "w": 102},
    {"name": "Plastic Storage Organizer Desktop Tray 3 Compartments", "hsn": "3924", "gst_rate": 18, "r": 85, "w": 62},
    {"name": "Plastic Transparent Measuring Mug 1 Liter", "hsn": "3924", "gst_rate": 18, "r": 50, "w": 36},
    {"name": "BPA Free Plastic School Water Bottle 750ml with Straw", "hsn": "3924", "gst_rate": 18, "r": 95, "w": 70},
    {"name": "Steel Safety Pins Assorted Sizes (Box of 100)", "hsn": "7319", "gst_rate": 18, "r": 30, "w": 20},
    {"name": "Satin Ribbon Roll 1 Inch (25 Yards) - Red", "hsn": "5806", "gst_rate": 12, "r": 45, "w": 32},
    {"name": "Satin Ribbon Roll 1 Inch (25 Yards) - Golden Yellow", "hsn": "5806", "gst_rate": 12, "r": 45, "w": 32},
    {"name": "Birthday Golden Foil Balloon Banner 'HAPPY BIRTHDAY'", "hsn": "9505", "gst_rate": 18, "r": 90, "w": 65},
    {"name": "Party Confetti Popper Cannon 30cm Spring Loaded", "hsn": "9505", "gst_rate": 18, "r": 60, "w": 42},
    {"name": "Glossy Designer Gift Wrapping Paper Sheets (Pack of 10)", "hsn": "4802", "gst_rate": 12, "r": 50, "w": 35},
    {"name": "Link Brass Padlock 40mm Heavy Duty with 3 Keys", "hsn": "8301", "gst_rate": 18, "r": 175, "w": 140},
    {"name": "Godrej Nav-Tal 7 Levers Solid Brass Padlock", "hsn": "8301", "gst_rate": 18, "r": 390, "w": 330},
    {"name": "Strong Virgin Nylon Packaging Rope 100m Roll", "hsn": "5607", "gst_rate": 12, "r": 80, "w": 58},
    {"name": "Heavy Duty White Cotton Thread Spool (Pack of 2)", "hsn": "5204", "gst_rate": 5, "r": 40, "w": 28},
    {"name": "Cello Plastic Clothes Drying Pegs / Clips (Pack of 12)", "hsn": "3924", "gst_rate": 18, "r": 60, "w": 44},
]

# List of 18 realistic customers
customers_data = [
    # Wholesale Customers (Institutions, Mills, Schools, Banks)
    {
        "name": "Annur Public Matriculation Hr Sec School",
        "contact": "9842100112",
        "gst": "33AAAPA1234A1Z5",
        "address": "12, Kovai Road, Annur - 641653",
        "group_id": WHOLESALE_GROUP_ID
    },
    {
        "name": "Sri Murugan Textiles & Garments",
        "contact": "9842233445",
        "gst": "33AABCS5544B1Z2",
        "address": "45/2, Sathy Road, Annur - 641653",
        "group_id": WHOLESALE_GROUP_ID
    },
    {
        "name": "Annur Cotton Mills Spinning Unit",
        "contact": "9443155667",
        "gst": "33AABCA8899C1Z8",
        "address": "Avinashi Road, Annur - 641653",
        "group_id": WHOLESALE_GROUP_ID
    },
    {
        "name": "Saraswathi Vidyalaya CBSE School",
        "contact": "9788112233",
        "gst": "33AAASS9988D1Z4",
        "address": "Mettupalayam Road, Annur",
        "group_id": WHOLESALE_GROUP_ID
    },
    {
        "name": "KG Denim Spinners Pvt Ltd",
        "contact": "9442200331",
        "gst": "33AABCK1122E1Z1",
        "address": "Karumathampatti Road, Annur",
        "group_id": WHOLESALE_GROUP_ID
    },
    {
        "name": "Kovai Paper & Xerox Mart",
        "contact": "9894455667",
        "gst": "33AABCK7788F1Z9",
        "address": "Bus Stand Complex, Annur",
        "group_id": WHOLESALE_GROUP_ID
    },
    {
        "name": "Maruthi Polytechnic College",
        "contact": "9843322110",
        "gst": "33AAAPM3344G1Z3",
        "address": "Sathy Main Road, Kunnathur",
        "group_id": WHOLESALE_GROUP_ID
    },
    {
        "name": "Tamilnadu Mercantile Bank Annur Branch",
        "contact": "04254262100",
        "gst": "33AAACT1742H1Z6",
        "address": "194 Kovai Road, Annur - 641653",
        "group_id": WHOLESALE_GROUP_ID
    },
    {
        "name": "Sri Lakshmi Auto Spares & Garage",
        "contact": "9789944332",
        "gst": "33AADCL5566J1Z0",
        "address": "Coimbatore Main Road, Annur",
        "group_id": WHOLESALE_GROUP_ID
    },

    # Retail Customers (Regular local individuals, teachers, shops)
    {
        "name": "Ramesh Kumar (Stationery Contractor)",
        "contact": "9842512345",
        "gst": None,
        "address": "South Car Street, Annur",
        "group_id": RETAIL_GROUP_ID
    },
    {
        "name": "Senthil Nathan (Tailoring Shop)",
        "contact": "9443789012",
        "gst": None,
        "address": "Bazaar Street, Annur",
        "group_id": RETAIL_GROUP_ID
    },
    {
        "name": "Dr. Priya Soundararajan (Dental Clinic)",
        "contact": "9843055441",
        "gst": None,
        "address": "Opp. Govt Hospital, Annur",
        "group_id": RETAIL_GROUP_ID
    },
    {
        "name": "Murugesan K (Farmer & Poultry)",
        "contact": "9788411223",
        "gst": None,
        "address": "Kaniyur Pirivu, Annur",
        "group_id": RETAIL_GROUP_ID
    },
    {
        "name": "Kavitha Rajendran (Govt School Teacher)",
        "contact": "9894123344",
        "gst": None,
        "address": "Teachers Colony, Annur",
        "group_id": RETAIL_GROUP_ID
    },
    {
        "name": "Manikandan V (Electrical Contractor)",
        "contact": "9629144556",
        "gst": None,
        "address": "Vadambacheri Road, Annur",
        "group_id": RETAIL_GROUP_ID
    },
    {
        "name": "Karthik Provision Store",
        "contact": "9944233112",
        "gst": None,
        "address": "Othimalai Road, Annur",
        "group_id": RETAIL_GROUP_ID
    },
    {
        "name": "Revathi Beauty Care",
        "contact": "9750011223",
        "gst": None,
        "address": "Main Bazaar, Annur",
        "group_id": RETAIL_GROUP_ID
    },
    {
        "name": "Balasubramaniam (Cotton Broker)",
        "contact": "9443366778",
        "gst": None,
        "address": "Kovai Road, Annur",
        "group_id": RETAIL_GROUP_ID
    }
]

import random
import time

print("Seeding demo data into SQLite database...")

# Clear existing dummy products
db.query(models.Product).delete()
print("Cleared existing test products.")

# Insert products
count = 0
for idx, p in enumerate(products_data):
    pid = str(int(time.time() * 1000) + idx * 17)
    prices = {
        RETAIL_GROUP_ID: float(p["r"]),
        WHOLESALE_GROUP_ID: float(p["w"])
    }
    prod = models.Product(
        id=pid,
        name=p["name"],
        hsn=p["hsn"],
        gst_rate=p["gst_rate"],
        prices=prices
    )
    db.add(prod)
    count += 1

db.commit()
print(f"Successfully seeded {count} products!")

# Clear existing dummy customers
db.query(models.Customer).delete()
print("Cleared existing test customers.")

# Insert customers
c_count = 0
for idx, c in enumerate(customers_data):
    cid = str(int(time.time() * 1000) + idx * 23 + 500)
    cust = models.Customer(
        id=cid,
        customer_name=c["name"],
        contact=c["contact"],
        gst=c["gst"],
        address=c["address"],
        group_id=c["group_id"]
    )
    db.add(cust)
    c_count += 1

db.commit()
print(f"Successfully seeded {c_count} customers!")

db.close()
print("Database seeding completed cleanly.")
