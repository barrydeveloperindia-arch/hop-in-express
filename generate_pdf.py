from fpdf import FPDF
import os

# Design Constants
ACCENT_COLOR = (20, 30, 70) # Deep Navy (Almost Black)
TEXT_COLOR = (40, 40, 40)
BG_LIGHT = (250, 250, 250)
WHITE = (255, 255, 255)

class PDF(FPDF):
    def header(self):
        # Very minimal header, mostly whitespace
        if self.page_no() > 1:
            # Small logo top right
            if os.path.exists('logo.jpg'):
                self.image('logo.jpg', 180, 10, 20)
            
            # Simple line top left
            self.set_draw_color(*ACCENT_COLOR) # Accent
            self.set_line_width(0.5)
            self.line(10, 15, 100, 15)

    def footer(self):
        # Modern minimal footer
        self.set_y(-15)
        self.set_font('Arial', '', 7)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"SWATI ANAND'S CONSULTANCY  |  PAGE {self.page_no()}", 0, 0, 'R')

def draw_title(pdf, number, title):
    # Big Number
    pdf.set_font('Arial', 'B', 40)
    pdf.set_text_color(220, 220, 220) # Light grey text for background number
    pdf.cell(25, 15, number, 0, 0, 'L')
    
    # Title Overlay
    pdf.set_x(35)
    pdf.set_font('Arial', 'B', 18)
    pdf.set_text_color(*ACCENT_COLOR)
    pdf.cell(0, 15, title.upper(), 0, 1, 'L')
    
    # Underline
    pdf.set_draw_color(*ACCENT_COLOR)
    pdf.set_line_width(1)
    pdf.line(35, pdf.get_y(), 100, pdf.get_y())
    pdf.ln(10)

def body_paragraph(pdf, text):
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(*TEXT_COLOR)
    pdf.multi_cell(0, 6, text)
    pdf.ln(8)

pdf = PDF()
pdf.set_margins(15, 15, 15)
pdf.set_auto_page_break(auto=True, margin=20)

# --- COVER PAGE ---
pdf.add_page()

# Split Layout: Left Image strip, Right Content? 
# Or Top Image, Bottom massive typography.
# Let's go with Reference Image style: Left Vertical Image? Or Top Image.
# Let's do a Full Top Image (Modern Magazine Style).

if os.path.exists('cover_bg.jpg'):
    # Full bleed image cover top 60%
    pdf.image('cover_bg.jpg', 0, 0, 210, 170)

# White block overlapping slightly
pdf.set_fill_color(*WHITE)
pdf.rect(0, 170, 210, 127, 'F')

# Decorative Line
pdf.set_fill_color(*ACCENT_COLOR)
pdf.rect(15, 160, 5, 40, 'F') # Vertical Accent Bar overlapping image and text area

# Typography
pdf.set_y(175)
pdf.set_x(25)
pdf.set_font('Arial', 'B', 32)
pdf.set_text_color(*ACCENT_COLOR)
pdf.multi_cell(170, 14, "UNLOCK THE\nFULL POTENTIAL\nOF YOUR LAND.", 0, 'L')

# Subtext
pdf.set_y(230)
pdf.set_x(25)
pdf.set_font('Arial', '', 12)
pdf.set_text_color(100, 100, 100)
pdf.multi_cell(160, 6, "End-to-End Licensing, Regulatory Compliance & Strategic Planning for Haryana's Real Estate Sector.", 0, 'L')

# Logo at bottom right
if os.path.exists('logo.jpg'):
    pdf.image('logo.jpg', 160, 250, 35)

# --- PAGE 2: DDJAY ---
pdf.add_page()
draw_title(pdf, "01", "Residential Licensing")

# Layout: Text Left, Graphic Right (Top aligned)
# Since FPDF flows linearly, we manage X/Y
start_y = pdf.get_y()

# Left Column (Text) needs to be narrower
pdf.set_right_margin(90) # Leave space for image
body_paragraph(pdf, "Affordable Plotted Housing (DDJAY) is the most lucrative segment in Haryana. We specialize in maximizing your returns by optimizing saleable area (55%) and commercial components (4%).")

pdf.set_font('Arial', 'B', 10)
pdf.cell(0, 8, "Your Advantages:", 0, 1)
body_paragraph(pdf, "- Precision LC-V Filing\n- Layout Optimization (55% Saleable)\n- Strategic Commercial Placement\n- Accurate Bank Guarantee Calculation")

# Right Column (Visual)
pdf.set_right_margin(15) # Reset
if os.path.exists('ddjay_graphic.jpg'):
    pdf.image('ddjay_graphic.jpg', 125, start_y, 70)

# Bottom "Block" for emphasis
pdf.set_y(130)
pdf.set_fill_color(245, 245, 245)
pdf.rect(0, 130, 210, 30, 'F')
pdf.set_y(138)
pdf.set_x(15)
pdf.set_font('Arial', 'I', 11)
pdf.set_text_color(*ACCENT_COLOR)
pdf.cell(0, 10, "Maximizing Returns. Ensuring 100% Compliance.", 0, 1, 'C')


# --- PAGE 3: PROJECTS ---
pdf.add_page()
draw_title(pdf, "02", "High-Value Development")

if os.path.exists('projects_graphic.jpg'):
    # Full width banner style
    pdf.image('projects_graphic.jpg', 15, pdf.get_y(), 180, 60)
    pdf.ln(65)

# 3 Grid Layout (Simulated)
# Col 1
y_grid = pdf.get_y()
w_col = 55
gap = 5

pdf.set_xy(15, y_grid)
pdf.set_font('Arial', 'B', 11)
pdf.multi_cell(w_col, 5, "NILP 2022\nStrategy")
pdf.set_font('Arial', '', 9)
pdf.set_xy(15, y_grid+12)
pdf.multi_cell(w_col, 5, "Guiding Group Housing projects to utilize 8% Commercial Component for cross-subsidization.")

# Col 2
pdf.set_xy(15 + w_col + gap, y_grid)
pdf.set_font('Arial', 'B', 11)
pdf.multi_cell(w_col, 5, "CLU\nChange of Land Use")
pdf.set_font('Arial', '', 9)
pdf.set_xy(15 + w_col + gap, y_grid+12)
pdf.multi_cell(w_col, 5, "Industrial & Warehousing CLU via Online DTCP Portal with MOEF Clearance handling.")

# Col 3
pdf.set_xy(15 + 2*w_col + 2*gap, y_grid)
pdf.set_font('Arial', 'B', 11)
pdf.multi_cell(w_col, 5, "Outdoor Media\nDevices")
pdf.set_font('Arial', '', 9)
pdf.set_xy(15 + 2*w_col + 2*gap, y_grid+12)
pdf.multi_cell(w_col, 5, "Registration and e-auctions under Haryana Municipal Bye-laws 2022.")

pdf.ln(30) # reset flow

# --- PAGE 4: COMPLIANCE ---
pdf.add_page()
draw_title(pdf, "03", "RERA & Legal Safety")

# Design: Large vertical Accent Bar with Icon inside
pdf.set_fill_color(*ACCENT_COLOR)
pdf.rect(0, 0, 60, 297, 'F') 

# White Text on Navy
pdf.set_text_color(*WHITE)
pdf.set_font('Arial', 'B', 24)
pdf.set_xy(5, 100)
pdf.multi_cell(50, 10, "YOUR\nSHIELD", 0, 'R')

if os.path.exists('shield.jpg'):
    pdf.image('shield.jpg', 10, 140, 40)

# Content on right side
pdf.set_left_margin(70)
pdf.set_x(70)
pdf.set_y(50)

body_paragraph(pdf, "We act as your compliance shield against project freezes and penalties. Our expertise ensures your project never hits a regulatory roadblock.")
pdf.ln(10)

# Bullet list style
for item in ["Mandatory 70% Escrow Account", "Quarterly REP-1 Filings", "NGT & PLPA Due Diligence", "EDC Audit & Verification"]:
    pdf.set_font('Arial', 'B', 20)
    pdf.set_text_color(200, 200, 200) # Light grey numbering style bullets
    pdf.cell(10, 10, ">", 0, 0)
    pdf.set_font('Arial', '', 12)
    pdf.set_text_color(*TEXT_COLOR)
    pdf.cell(0, 10, item, 0, 1)

# Reset margins
pdf.set_left_margin(15)

# --- PAGE 5: FEES & CONTACT ---
pdf.add_page()
draw_title(pdf, "04", "Professional Fee Structure")

# Clean Minimal Table
pdf.set_font('Arial', 'B', 9)
pdf.set_draw_color(220, 220, 220)
pdf.set_line_width(0.1)

# Header Line
pdf.line(15, pdf.get_y(), 195, pdf.get_y())
pdf.ln(2)

rows = [
    ("DDJAY Licensing", "2,00,000 + 50k/acre"),
    ("Change of Land Use (CLU)", "1.5L - 3.0L per file"),
    ("RERA Registration", "50k - 1L per project"),
    ("NILP Advisory", "5,00,000 (Flat Fee)"),
    ("NILP '22 / GH Licensing", "13,00,000 (End-to-End)"),
    ("Outdoor Media", "25,000 per site")
]

for service, fee in rows:
    pdf.set_font('Arial', 'B', 10)
    pdf.cell(110, 12, service.upper(), 'B', 0, 'L')
    pdf.set_font('Arial', '', 10)
    pdf.cell(70, 12, fee, 'B', 1, 'R')

pdf.ln(5)
pdf.set_font('Arial', 'I', 8)
pdf.cell(0, 10, "* Statutory Govt Fees paid by client at actuals.", 0, 1)

# Footer Massive Contact Block
pdf.set_y(220)
pdf.set_fill_color(245, 245, 245)
pdf.rect(0, 220, 210, 77, 'F')

pdf.set_y(230)
pdf.set_font('Arial', 'B', 14)
pdf.set_text_color(*ACCENT_COLOR)
pdf.cell(0, 10, "START YOUR PROJECT TODAY", 0, 1, 'C')

pdf.set_font('Arial', '', 11)
pdf.set_text_color(80, 80, 80)
pdf.cell(0, 8, "Disha Arcade, Sixth Floor, Sky5 Building, Sector 4 MDC, Panchkula", 0, 1, 'C')
pdf.cell(0, 8, "+91 98784 07934", 0, 1, 'C')
pdf.cell(0, 8, "planner.swati@gmail.com", 0, 1, 'C')

filename = 'Swati_Anand_Brochure_International.pdf'
pdf.output(filename, 'F')
print(f"PDF Generated: {filename}")
