from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        # Logo placeholder (commented out as file not present)
        # self.image('logo.png', 10, 8, 33)
        
        # Colors: Navy Blue headers
        self.set_text_color(20, 30, 70) 
        self.set_font('Arial', 'B', 12)
        # Small header on pages > 1
        if self.page_no() > 1:
            self.cell(0, 10, "Swati Anand's Consultancy", 0, 0, 'R')
            self.ln(15)

    def footer(self):
        self.set_y(-20)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 5, "Swati Anand's Consultancy | +91 98784 07934 | planner.swati@gmail.com", 0, 1, 'C')
        self.cell(0, 5, 'Page ' + str(self.page_no()) + '/{nb}', 0, 0, 'C')

def create_bullet(pdf, text):
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(10, 8, ">", 0, 0)
    pdf.set_font('Arial', '', 11)
    pdf.multi_cell(0, 8, text)
    pdf.ln(2)

def section_header(pdf, text):
    pdf.set_fill_color(240, 240, 245) # Slate grey light
    pdf.set_text_color(20, 30, 70) # Navy
    pdf.set_font('Arial', 'B', 16)
    pdf.cell(0, 12, text, 0, 1, 'L', True)
    pdf.ln(5)
    pdf.set_text_color(0, 0, 0) # Reset to black

pdf = PDF()
pdf.alias_nb_pages()
pdf.set_auto_page_break(auto=True, margin=25)

# --- PAGE 1: FRONT COVER ---
pdf.add_page()
pdf.set_y(60) # Start lower

# Headline
pdf.set_font('Arial', 'B', 24)
pdf.set_text_color(20, 30, 70) # Navy
pdf.multi_cell(0, 15, "Unlock the Full Potential of Your Land in Haryana.", 0, 'C')
pdf.ln(10)

# Sub-headline
pdf.set_font('Arial', '', 14)
pdf.set_text_color(50, 50, 50)
pdf.multi_cell(0, 10, "End-to-End Licensing, Regulatory Compliance, and Strategic Planning for DDJAY, Group Housing, and Commercial Projects.", 0, 'C')
pdf.ln(30)

# Visual Placeholder (Text box for now)
pdf.set_fill_color(230, 230, 230)
pdf.cell(0, 60, "[ VISUAL: City Skyline & Blueprint ]", 0, 1, 'C', True)
pdf.ln(30)

# Bottom Quote
pdf.set_font('Arial', 'I', 12)
pdf.set_text_color(100, 100, 100)
pdf.multi_cell(0, 10, '"From raw land to RERA Registration - we handle the bureaucracy so you can focus on construction."', 0, 'C')


# --- PAGE 2: DDJAY ---
pdf.add_page()
section_header(pdf, "Residential Licensing: DDJAY")

pdf.set_font('Arial', '', 12)
pdf.multi_cell(0, 8, "Affordable Plotted Housing is the most lucrative segment in Haryana. We specialize in maximizing your returns while remaining 100% compliant.")
pdf.ln(10)

# Visual Placeholder
pdf.set_font('Arial', 'B', 10)
pdf.set_fill_color(220, 255, 220) # Light Green
pdf.cell(90, 40, "55% Saleable Area", 1, 0, 'C', True)
pdf.set_fill_color(220, 220, 220) # Grey
pdf.cell(90, 40, "45% Roads/Open Spaces", 1, 1, 'C', True)
pdf.ln(10)

# Bullets
create_bullet(pdf, "Application Filing (Form LC-V): Precision handling of ownership documents.")
create_bullet(pdf, "Layout Optimization: Maximizing the 55% permissible saleable area.")
create_bullet(pdf, "Commercial Strategy: Strategic placement of the 4% Commercial Component for high footfall.")
create_bullet(pdf, "Financial Safeguards: Calculating exact Bank Guarantees (25%) to save capital.")


# --- PAGE 3: HIGH VALUE PROJECTS ---
pdf.add_page()
section_header(pdf, "High-Value Development & Strategy")

# Section 1
pdf.set_font('Arial', 'B', 14)
pdf.set_text_color(20, 30, 70)
pdf.cell(0, 10, "1. NILP 2022 Strategy", 0, 1)
pdf.set_font('Arial', '', 11)
pdf.set_text_color(0, 0, 0)
pdf.multi_cell(0, 6, "We guide Group Housing projects to utilize the 8% Commercial Component for cross-subsidization, maximizing profitability.")
pdf.ln(5)

# Section 2
pdf.set_font('Arial', 'B', 14)
pdf.set_text_color(20, 30, 70)
pdf.cell(0, 10, "2. CLU (Change of Land Use)", 0, 1)
pdf.set_font('Arial', '', 11)
pdf.set_text_color(0, 0, 0)
pdf.multi_cell(0, 6, "Expert handling of Change of Land Use for Industrial units and Warehousing via the Online DTCP Portal. Includes MOEF Clearance handling.")
pdf.ln(5)

# Section 3
pdf.set_font('Arial', 'B', 14)
pdf.set_text_color(20, 30, 70)
pdf.cell(0, 10, "3. Outdoor Media Devices (OMD)", 0, 1)
pdf.set_font('Arial', '', 11)
pdf.set_text_color(0, 0, 0)
pdf.multi_cell(0, 6, "Registration for Outdoor Media Devices and e-auctions under Haryana Municipal Bye-laws 2022.")
pdf.ln(10)

# Visual
pdf.set_fill_color(230, 230, 240)
pdf.cell(60, 40, "High-Rise", 1, 0, 'C', True)
pdf.cell(60, 40, "Modern Warehouse", 1, 0, 'C', True)
pdf.cell(60, 40, "Digital Billboard", 1, 1, 'C', True)


# --- PAGE 4: RERA ---
pdf.add_page()
section_header(pdf, "RERA Compliance & Legal Safety")

pdf.set_font('Arial', '', 12)
pdf.multi_cell(0, 8, "We act as your compliance shield against project freezes and penalties. Our expertise ensures your project never hits a regulatory roadblock.")
pdf.ln(10)

# Shield Visual Placeholder
pdf.set_fill_color(255, 248, 220) # Gold-ish
pdf.cell(0, 30, "[ RERA COMPLIANT SHIELD ]", 1, 1, 'C', True)
pdf.ln(10)

# Features
create_bullet(pdf, "Financial Discipline: Setup of mandatory 70% Escrow and 30% Free Accounts.")
create_bullet(pdf, "Statutory Filings: Quarterly Form REP-1 submission and Agent Registration.")
create_bullet(pdf, "Legal Defense: Due diligence for National Green Tribunal (NGT) and PLPA clearances.")
create_bullet(pdf, "EDC Audits: We verify External Development Charges to prevent overpayment.")


# --- PAGE 5: FEES & CONTACT ---
pdf.add_page()
section_header(pdf, "Fee Structure & Contact")

# Table Header
pdf.set_font('Arial', 'B', 11)
pdf.set_fill_color(20, 30, 70)
pdf.set_text_color(255, 255, 255)
pdf.cell(100, 10, "Service", 1, 0, 'L', True)
pdf.cell(90, 10, "Professional Fee", 1, 1, 'L', True)

# Table Rows
pdf.set_text_color(0, 0, 0)
pdf.set_font('Arial', '', 11)

rows = [
    ("DDJAY Licensing", "2,00,000 Retainer + 50,000/acre"),
    ("Change of Land Use (CLU)", "1.5L - 3.0L per file"),
    ("RERA Registration", "50k - 1L per project"),
    ("NILP Advisory", "5,00,000 (Flat Fee)"),
    ("Outdoor Media", "25,000 per site")
]

fill = False
for service, fee in rows:
    if fill:
        pdf.set_fill_color(240, 240, 240)
    else:
        pdf.set_fill_color(255, 255, 255)
    
    pdf.cell(100, 10, service, 1, 0, 'L', fill)
    pdf.cell(90, 10, fee, 1, 1, 'L', fill)
    fill = not fill

pdf.ln(5)
pdf.set_font('Arial', 'I', 9)
pdf.cell(0, 10, "* Statutory Govt Fees paid by client at actuals.", 0, 1)

pdf.ln(20)

# Footer Detail
pdf.set_fill_color(20, 30, 70)
pdf.set_text_color(255, 255, 255)
pdf.set_font('Arial', 'B', 14)
pdf.cell(0, 12, "Contact Us Today", 0, 1, 'C', True)

pdf.set_text_color(0, 0, 0)
pdf.ln(5)
pdf.set_font('Arial', '', 12)
pdf.multi_cell(0, 8, "Expert Guidance from a Retired Senior Town Planner.\nAddress: Disha Arcade, Sixth Floor, Sky5 Building, Sector 4 MDC, Panchkula, Haryana.\nPhone: +91 98784 07934\nEmail: planner.swati@gmail.com", 0, 'C')

# Output
filename = 'Swati_Anand_Brochure_v2.pdf'
pdf.output(filename, 'F')
print(f"PDF Generated: {filename}")
