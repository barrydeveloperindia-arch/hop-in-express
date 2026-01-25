from fpdf import FPDF
import os

# Ultra Modern Palette
DEEP_NAVY = (10, 20, 50)
GOLD = (200, 160, 50)
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GREY_TEXT = (50, 50, 50)

class PDF(FPDF):
    def footer(self):
        # Minimalist Page Marker
        if self.page_no() > 1:
            self.set_y(-15)
            self.set_font('Helvetica', '', 8)
            self.set_text_color(150, 150, 150)
            self.cell(0, 10, f"SWATI ANAND CONSULTANCY  |  0{self.page_no()-1}", 0, 0, 'R')

def draw_massive_header(pdf, text):
    pdf.set_font('Times', 'B', 60) # Massive Serif
    pdf.set_text_color(*BLACK)
    pdf.cell(0, 25, text, 0, 1, 'L')
    
    # Gold Underline
    pdf.set_fill_color(*GOLD)
    pdf.rect(pdf.get_x(), pdf.get_y(), 40, 2, 'F')
    pdf.ln(15)

def draw_section_label(pdf, label):
    pdf.set_font('Helvetica', 'B', 10)
    pdf.set_text_color(*DEEP_NAVY)
    pdf.cell(0, 8, label.upper(), 0, 1, 'L')

def body_text(pdf, text):
    pdf.set_font('Times', '', 12)
    pdf.set_text_color(*GREY_TEXT)
    pdf.multi_cell(0, 6, text)
    pdf.ln(8)

pdf = PDF()
pdf.set_margins(25, 25, 25)
pdf.set_auto_page_break(auto=True, margin=20)

# --- COVER PAGE: THE STANDARD ---
pdf.add_page()
pdf.set_fill_color(*DEEP_NAVY)
pdf.rect(0, 0, 210, 297, 'F')

# Huge White Typography
pdf.set_text_color(*WHITE)
pdf.set_font('Helvetica', 'B', 45)
pdf.set_xy(25, 60)
pdf.multi_cell(160, 20, "THE\nSWATI ANAND\nSTANDARD")

# Gold Accent
pdf.set_draw_color(*GOLD)
pdf.set_line_width(1)
pdf.line(25, 190, 25, 270) # Vertical Line

# Bottom Details
pdf.set_xy(35, 250)
pdf.set_font('Times', '', 12)
pdf.multi_cell(0, 6, "UNLOCKING THE FULL POTENTIAL\nOF YOUR LAND IN HARYANA")

# Logo (if exists)
if os.path.exists('logo.jpg'):
    # White box for logo contrast if needed, or assume logo handles it
    pdf.image('logo.jpg', 160, 250, 30)


# --- PAGE 2: RESIDENTIAL (DDJAY) ---
pdf.add_page()
draw_massive_header(pdf, "DDJAY")

# Layout: 2 Columns
col_width = 75
gutter = 10
y_start = pdf.get_y()

# Left Col: Text
draw_section_label(pdf, "Strategic Residential Licensing")
body_text(pdf, "Deen Dayal Jan Awas Yojna (DDJAY) represents the pinnacle of affordable housing opportunities. Our firm specializes in the micro-optimization of land usage, ensuring you achieve the maximum permissible Saleable Area of 55%.")

pdf.ln(5)
draw_section_label(pdf, "Policy Expertise (1975-2025)")
body_text(pdf, "Navigating the Haryana Development and Regulation of Urban Areas Act requires historical insight. We leverage 25+ years of policy evolution to future-proof your license.")

# Right Col: Metrics & Visual
pdf.set_xy(25 + col_width + gutter, y_start)

# Big Metric
pdf.set_font('Helvetica', 'B', 40)
pdf.set_text_color(*DEEP_NAVY)
pdf.cell(col_width, 15, "55%", 0, 1)
pdf.set_font('Times', 'I', 12)
pdf.set_text_color(*GREY_TEXT)
pdf.set_x(25 + col_width + gutter)
pdf.cell(col_width, 8, "Saleable Area Optimization", 0, 1)

pdf.ln(10)
pdf.set_x(25 + col_width + gutter)
if os.path.exists('ddjay_graphic.jpg'):
    pdf.image('ddjay_graphic.jpg', x=pdf.get_x(), w=col_width)


# --- PAGE 3: INDUSTRIAL ---
pdf.add_page()

# Full Bleed Image Top Half
if os.path.exists('projects_graphic.jpg'):
    pdf.image('projects_graphic.jpg', 0, 0, 210, 160)
else:
    pdf.set_fill_color(220, 220, 220)
    pdf.rect(0, 0, 210, 160, 'F')

# Overlay Overlay
pdf.set_fill_color(*DEEP_NAVY)
pdf.rect(25, 130, 160, 60, 'F') # Floating box

pdf.set_xy(35, 145)
pdf.set_text_color(*WHITE)
pdf.set_font('Times', 'B', 32)
pdf.cell(0, 15, "INDUSTRIAL PLANNING", 0, 1)
pdf.set_x(35)
pdf.set_font('Helvetica', '', 10)
pdf.cell(0, 8, "CHANGE OF LAND USE (CLU) & ADVISORY", 0, 1)

# Text Bottom
pdf.set_y(200)
pdf.set_text_color(*BLACK)
body_text(pdf, "We facilitate the end-to-end establishment of Industrial Parks and Factory Complexes. From site compatibility analysis to HSIIDC norms compliance and MOEF clearances, our pathway is direct and secure.")


# --- PAGE 4: FEES & CONTACT ---
pdf.add_page()
draw_massive_header(pdf, "FEES")

pdf.set_y(60)

# Minimalist Table - No Vertical Lines
rows = [
    ("DDJAY Licensing", "2.00 Lakh + 50k/acre"),
    ("Change of Land Use (CLU)", "1.5L - 3.0L / file"),
    ("RERA Registration", "50k - 1.5L / project"),
    ("NILP Advisory", "5.00 Lakh (Fixed)"),
    ("Industrial Licensing", "15.00 Lakh (End-to-End)")
]

pdf.set_draw_color(200, 200, 200)
pdf.line(25, 55, 185, 55) # Header line

for service, fee in rows:
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(*DEEP_NAVY)
    pdf.cell(100, 14, service.upper(), 'B', 0, 'L')
    
    pdf.set_font('Times', '', 12)
    pdf.set_text_color(*BLACK)
    pdf.cell(60, 14, fee, 'B', 1, 'R')

pdf.ln(15)

# Contact Block - Bottom Left
pdf.set_font('Helvetica', 'B', 14)
pdf.set_text_color(*BLACK)
pdf.cell(0, 10, "CONTACT", 0, 1)

pdf.set_font('Times', '', 12)
pdf.set_text_color(*GREY_TEXT)
pdf.multi_cell(0, 6, "Disha Arcade, 6th Floor\nSky5 Building, Sector 4 MDC\nPanchkula, Haryana\n\n+91 98784 07934\nplanner.swati@gmail.com")

filename = 'Swati_Anand_Brochure_UltraModern.pdf'
pdf.output(filename, 'F')
print(f"PDF Generated: {filename}")
