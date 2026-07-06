import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const chapters = {
  Physics: [
    { name: "Mechanics", topics: ["Kinematics", "Laws of Motion", "Work Energy Power", "Rotational Motion", "Gravitation"] },
    { name: "Thermodynamics", topics: ["Thermal Properties", "Kinetic Theory", "Laws of Thermodynamics", "Heat Transfer"] },
    { name: "Current Electricity", topics: ["Ohm's Law", "Kirchhoff's Laws", "Electrical Measurements", "Circuits"] },
    { name: "Electrostatics", topics: ["Coulomb's Law", "Electric Field", "Potential", "Capacitors", "Gauss Law"] },
    { name: "Optics", topics: ["Reflection", "Refraction", "Wave Optics", "Lenses", "Dispersion"] },
    { name: "Modern Physics", topics: ["Photoelectric Effect", "Atomic Models", "Nuclear Physics", "Semiconductors"] },
    { name: "Magnetism", topics: ["Magnetic Fields", "EMI", "AC Circuits", "Electromagnetic Waves"] },
    { name: "Waves & Sound", topics: ["Simple Harmonic Motion", "Wave Motion", "Sound Waves", "Doppler Effect"] },
  ],
  Chemistry: [
    { name: "Physical Chemistry", topics: ["Mole Concept", "Atomic Structure", "Chemical Bonding", "Thermodynamics", "Equilibrium", "Kinetics", "Electrochemistry"] },
    { name: "Organic Chemistry", topics: ["Hydrocarbons", "Alcohols Phenols", "Aldehydes Ketones", "Carboxylic Acids", "Amines", "Biomolecules", "Polymers"] },
    { name: "Inorganic Chemistry", topics: ["Periodic Table", "s-block Elements", "p-block Elements", "d-block Elements", "Coordination Compounds", "Metallurgy"] },
  ],
  Mathematics: [
    { name: "Algebra", topics: ["Sets Relations", "Complex Numbers", "Quadratic Equations", "Sequences Series", "Binomial Theorem", "Permutations Combinations", "Matrices Determinants"] },
    { name: "Calculus", topics: ["Limits Continuity", "Differentiation", "Application of Derivatives", "Integration", "Differential Equations", "Area Under Curve"] },
    { name: "Coordinate Geometry", topics: ["Straight Lines", "Circles", "Conic Sections", "Parabola", "Ellipse", "Hyperbola"] },
    { name: "Probability", topics: ["Probability Basics", "Conditional Probability", "Random Variables", "Bayes Theorem"] },
    { name: "Trigonometry", topics: ["Trigonometric Functions", "Inverse Trigonometry", "Trigonometric Equations", "Heights Distances"] },
  ],
}

interface QuestionData {
  text: string
  options: string[]
  correct: number
  explanation: string
  difficulty: "EASY" | "MEDIUM" | "HARD"
}

const physicsQuestions: Record<string, QuestionData[]> = {
  "Kinematics": [
    { text: "A particle starts from rest and moves with constant acceleration 2 m/s² for 5 s. The distance covered in the last second of motion is:", options: ["9 m", "7 m", "5 m", "11 m"], correct: 0, explanation: "Distance in nth second = u + a/2(2n-1) = 0 + 1(2×5-1) = 9 m", difficulty: "MEDIUM" },
    { text: "A ball is thrown vertically upward with velocity 20 m/s. The maximum height attained is: (g = 10 m/s²)", options: ["20 m", "40 m", "10 m", "30 m"], correct: 0, explanation: "H = u²/2g = 400/20 = 20 m", difficulty: "EASY" },
    { text: "Two projectiles are launched with same speed at angles 30° and 60°. The ratio of their horizontal ranges is:", options: ["1:1", "1:2", "2:1", "√3:1"], correct: 0, explanation: "Range = u²sin2θ/g. sin60° = sin120°, so ranges are equal.", difficulty: "MEDIUM" },
    { text: "A car moving at 72 km/h applies brakes producing a retardation of 5 m/s². The stopping distance is:", options: ["40 m", "80 m", "20 m", "60 m"], correct: 0, explanation: "v² = u² + 2as => 0 = 400 + 2(-5)s => s = 40 m", difficulty: "MEDIUM" },
    { text: "A body moving with uniform acceleration covers 24 m in 4th second and 40 m in 6th second. The initial velocity is:", options: ["4 m/s", "6 m/s", "8 m/s", "2 m/s"], correct: 2, explanation: "Sn = u + a/2(2n-1). Subtracting equations gives a = 4 m/s², u = 8 m/s", difficulty: "HARD" },
  ],
  "Laws of Motion": [
    { text: "A 10 kg block is pulled on a frictionless surface by a force of 50 N. The acceleration of the block is:", options: ["5 m/s²", "10 m/s²", "2 m/s²", "0.5 m/s²"], correct: 0, explanation: "a = F/m = 50/10 = 5 m/s²", difficulty: "EASY" },
    { text: "A 5 kg block is placed on a 10 kg block. The coefficient of friction between them is 0.4. The maximum horizontal force that can be applied to the lower block so that both move together is: (g = 10 m/s²)", options: ["60 N", "80 N", "40 N", "20 N"], correct: 0, explanation: "Fmax = (M+m)μg = 15×0.4×10 = 60 N", difficulty: "HARD" },
    { text: "A body of mass 2 kg is moving with velocity 3 m/s. A force of 4 N is applied for 2 seconds. The final velocity is:", options: ["7 m/s", "5 m/s", "11 m/s", "3 m/s"], correct: 0, explanation: "v = u + at = 3 + (4/2)×2 = 3 + 4 = 7 m/s", difficulty: "EASY" },
    { text: "Three blocks of masses m₁=1kg, m₂=2kg, m₃=3kg are connected by strings on a frictionless table. A force of 12 N is applied on m₃. Tension in string between m₁ and m₂ is:", options: ["2 N", "4 N", "6 N", "8 N"], correct: 0, explanation: "a = F/(m₁+m₂+m₃) = 12/6 = 2 m/s². T₁₂ = m₁a = 1×2 = 2 N", difficulty: "MEDIUM" },
  ],
  "Work Energy Power": [
    { text: "A force of 20 N displaces a body by 5 m at an angle of 60° to the direction of force. The work done is:", options: ["50 J", "100 J", "50√3 J", "25 J"], correct: 0, explanation: "W = Fs cosθ = 20×5×cos60° = 20×5×0.5 = 50 J", difficulty: "EASY" },
    { text: "A body of mass 2 kg is moving with velocity 4 m/s. Its kinetic energy is:", options: ["16 J", "8 J", "32 J", "4 J"], correct: 0, explanation: "KE = ½mv² = ½×2×16 = 16 J", difficulty: "EASY" },
    { text: "A 1 kg body is dropped from height 20 m. The power of gravity just before hitting ground is: (g = 10 m/s²)", options: ["200 W", "100 W", "50 W", "400 W"], correct: 0, explanation: "v = √(2gh) = √(400) = 20 m/s. P = mgv = 1×10×20 = 200 W", difficulty: "MEDIUM" },
    { text: "A spring of force constant k is compressed by x. The work done in compressing it further by x is:", options: ["½kx²", "kx²", "3/2 kx²", "2kx²"], correct: 2, explanation: "W = ½k(2x)² - ½kx² = 2kx² - ½kx² = 3/2 kx²", difficulty: "HARD" },
  ],
  "Rotational Motion": [
    { text: "Moment of inertia of a thin circular ring of mass M and radius R about an axis passing through its centre and perpendicular to its plane is:", options: ["MR²", "½MR²", "2MR²", "⅔MR²"], correct: 0, explanation: "For a thin circular ring, I = MR² about the central perpendicular axis.", difficulty: "EASY" },
    { text: "A disc of radius 0.5 m and mass 2 kg rotates at 10 rad/s. Its angular momentum is:", options: ["2.5 kg m²/s", "5 kg m²/s", "1.25 kg m²/s", "10 kg m²/s"], correct: 0, explanation: "I = ½MR² = ½×2×0.25 = 0.25. L = Iω = 0.25×10 = 2.5 kg m²/s", difficulty: "MEDIUM" },
    { text: "A sphere rolls down an inclined plane without slipping. The fraction of total KE that is rotational is:", options: ["2/7", "2/5", "1/2", "3/5"], correct: 0, explanation: "For sphere, I = 2/5 MR². Rotational KE fraction = (Iω²/2)/(½mv² + Iω²/2) = 2/7", difficulty: "HARD" },
  ],
  "Gravitation": [
    { text: "The escape velocity from Earth's surface is about 11.2 km/s. The escape velocity from a planet of twice the radius and same density is:", options: ["15.8 km/s", "22.4 km/s", "11.2 km/s", "5.6 km/s"], correct: 1, explanation: "ve ∝ √(M/R). If density is same, M ∝ R³, so ve ∝ R. ve = 11.2×2 = 22.4 km/s", difficulty: "HARD" },
    { text: "The acceleration due to gravity at a height equal to Earth's radius above the surface is:", options: ["g/4", "g/2", "g/8", "g"], correct: 0, explanation: "g' = g/(1+h/R)² = g/(1+1)² = g/4", difficulty: "MEDIUM" },
    { text: "Kepler's third law states that T² ∝ a³. For Earth, T = 1 year and a = 1 AU. For a planet with a = 8 AU, the orbital period is:", options: ["22.6 years", "8 years", "64 years", "2.8 years"], correct: 0, explanation: "T² = a³ => T = √(8³) = √512 ≈ 22.6 years", difficulty: "MEDIUM" },
  ],
  "Thermal Properties": [
    { text: "A copper rod of length 1 m is heated from 20°C to 120°C. Coefficient of linear expansion = 1.7×10⁻⁵ /°C. The increase in length is:", options: ["1.7 mm", "3.4 mm", "0.17 mm", "17 mm"], correct: 0, explanation: "ΔL = L₀αΔT = 1×1.7×10⁻⁵×100 = 1.7×10⁻³ m = 1.7 mm", difficulty: "EASY" },
    { text: "The temperature at which Fahrenheit and Celsius scales read the same value is:", options: ["-40°", "0°", "32°", "100°"], correct: 0, explanation: "F = C => 9C/5 + 32 = C => C = -40°", difficulty: "EASY" },
  ],
  "Kinetic Theory": [
    { text: "At a given temperature, the RMS velocity of oxygen molecules is v. The RMS velocity of hydrogen molecules at the same temperature is:", options: ["4v", "v/4", "2v", "v/2"], correct: 0, explanation: "vrms ∝ 1/√M. M(H₂)=2, M(O₂)=32. So vrms(H₂)/vrms(O₂) = √(32/2) = 4", difficulty: "MEDIUM" },
    { text: "The mean free path of gas molecules depends on:", options: ["Temperature and pressure both", "Temperature only", "Pressure only", "Neither temperature nor pressure"], correct: 0, explanation: "λ = kT/(√2πd²P), so it depends on both temperature and pressure.", difficulty: "MEDIUM" },
  ],
  "Laws of Thermodynamics": [
    { text: "In a cyclic process, the change in internal energy is:", options: ["Zero", "Positive", "Negative", "Depends on the process"], correct: 0, explanation: "In a cyclic process, the system returns to its initial state, so ΔU = 0.", difficulty: "EASY" },
    { text: "A Carnot engine operates between 127°C and 27°C. Its efficiency is:", options: ["25%", "50%", "75%", "100%"], correct: 0, explanation: "η = 1 - T₂/T₁ = 1 - 300/400 = 0.25 = 25%", difficulty: "MEDIUM" },
    { text: "The efficiency of a Carnot engine is 60%. If the sink temperature is 27°C, the source temperature is:", options: ["477°C", "750°C", "327°C", "204°C"], correct: 0, explanation: "η = 1 - T₂/T₁ => 0.6 = 1 - 300/T₁ => T₁ = 300/0.4 = 750 K = 477°C", difficulty: "HARD" },
  ],
  "Heat Transfer": [
    { text: "Two rods of same length and area have thermal conductivities k₁ and k₂. When joined in series, the equivalent thermal conductivity is:", options: ["2k₁k₂/(k₁+k₂)", "(k₁+k₂)/2", "k₁+k₂", "k₁k₂/(k₁+k₂)"], correct: 0, explanation: "In series, R_eq = L/(k₁A) + L/(k₂A) = 2L/(k_eq A). So k_eq = 2k₁k₂/(k₁+k₂)", difficulty: "HARD" },
    { text: "Newton's law of cooling states that the rate of cooling is proportional to:", options: ["Temperature difference with surroundings", "Absolute temperature", "Square of temperature", "Inverse of temperature"], correct: 0, explanation: "Newton's law: dT/dt = -k(T - T₀)", difficulty: "EASY" },
  ],
  "Ohm's Law": [
    { text: "A wire of resistance 4 Ω is stretched to twice its original length. Its new resistance is:", options: ["16 Ω", "8 Ω", "4 Ω", "2 Ω"], correct: 0, explanation: "R ∝ L²/A₀. If length doubles, volume constant => area half. R' = 4×4 = 16 Ω", difficulty: "MEDIUM" },
    { text: "The resistance of a conductor at 0°C is 5 Ω. Its resistance at 100°C is 7 Ω. The temperature coefficient of resistance is:", options: ["0.004 /°C", "0.04 /°C", "0.02 /°C", "0.4 /°C"], correct: 0, explanation: "α = (R₂-R₁)/(R₁ΔT) = (7-5)/(5×100) = 2/500 = 0.004 /°C", difficulty: "MEDIUM" },
  ],
  "Kirchhoff's Laws": [
    { text: "In a Wheatstone bridge, the condition for zero deflection in the galvanometer is:", options: ["R₁/R₂ = R₃/R₄", "R₁R₃ = R₂R₄", "R₁ + R₂ = R₃ + R₄", "R₁/R₃ = R₂/R₄"], correct: 0, explanation: "Wheatstone bridge balance condition: R₁/R₂ = R₃/R₄", difficulty: "EASY" },
    { text: "A 10 V battery is connected across a series combination of 2 Ω, 3 Ω, and 5 Ω resistors. The voltage drop across the 3 Ω resistor is:", options: ["3 V", "2 V", "5 V", "6 V"], correct: 0, explanation: "I = V/R_total = 10/10 = 1 A. V₃ = IR = 1×3 = 3 V", difficulty: "EASY" },
  ],
  "Electrical Measurements": [
    { text: "A voltmeter should have ____ resistance and an ammeter should have ____ resistance:", options: ["High, Low", "Low, High", "High, High", "Low, Low"], correct: 0, explanation: "Voltmeter is connected in parallel (high R to avoid current draw). Ammeter in series (low R to avoid voltage drop).", difficulty: "EASY" },
    { text: "A galvanometer of resistance 50 Ω gives full-scale deflection for 5 mA current. The shunt resistance needed to convert it to a 5 A ammeter is:", options: ["0.05 Ω", "0.5 Ω", "5 Ω", "0.005 Ω"], correct: 0, explanation: "S = Ig×G/(I-Ig) = 0.005×50/(5-0.005) ≈ 0.05 Ω", difficulty: "HARD" },
  ],
  "Circuits": [
    { text: "Three equal resistors connected in parallel have an equivalent resistance of 3 Ω. The value of each resistor is:", options: ["9 Ω", "3 Ω", "1 Ω", "6 Ω"], correct: 0, explanation: "1/R_eq = 3/R => R = 3×R_eq = 9 Ω", difficulty: "EASY" },
    { text: "A 10 μF capacitor is charged to 100 V. The energy stored is:", options: ["0.05 J", "0.5 J", "5 J", "0.005 J"], correct: 0, explanation: "E = ½CV² = ½×10×10⁻⁶×100² = 5×10⁻² = 0.05 J", difficulty: "MEDIUM" },
  ],
  "Coulomb's Law": [
    { text: "Two point charges +q and +4q are separated by distance r. The net electric field is zero at a distance from +q of:", options: ["r/3", "2r/3", "r/4", "r/2"], correct: 0, explanation: "E₁ = E₂ => kq/x² = k(4q)/(r-x)² => (r-x)/x = 2 => x = r/3", difficulty: "HARD" },
    { text: "The force between two charges separated by distance d is F. If the distance is halved and each charge is doubled, the new force is:", options: ["16F", "8F", "4F", "2F"], correct: 0, explanation: "F' = k(2q)(2q)/(d/2)² = k×4q²/(d²/4) = 16×kq²/d² = 16F", difficulty: "MEDIUM" },
  ],
  "Electric Field": [
    { text: "The electric field at a distance r from a point charge Q is E. The electric field at distance 2r is:", options: ["E/4", "E/2", "2E", "4E"], correct: 0, explanation: "E ∝ 1/r². So at 2r, E' = E/4", difficulty: "EASY" },
    { text: "An electric dipole placed in a uniform electric field experiences:", options: ["A torque but no net force", "A net force but no torque", "Both a net force and torque", "Neither a net force nor torque"], correct: 0, explanation: "In uniform field, forces on both charges are equal and opposite, producing torque but no net force.", difficulty: "MEDIUM" },
  ],
  "Potential": [
    { text: "The electric potential at a distance R from a point charge Q is V. The potential at distance 3R is:", options: ["V/3", "3V", "V/9", "9V"], correct: 0, explanation: "V ∝ 1/r. So at 3R, V' = V/3", difficulty: "EASY" },
    { text: "The work done in moving a charge q through a potential difference of V is:", options: ["qV", "q/V", "V/q", "qV²"], correct: 0, explanation: "W = qV, work done equals charge times potential difference.", difficulty: "EASY" },
  ],
  "Capacitors": [
    { text: "The equivalent capacitance of two capacitors of 6 μF and 3 μF connected in series is:", options: ["2 μF", "9 μF", "4.5 μF", "18 μF"], correct: 0, explanation: "C_eq = (6×3)/(6+3) = 18/9 = 2 μF", difficulty: "EASY" },
    { text: "A parallel plate capacitor has capacitance C. If a dielectric of constant K completely fills the space between plates, the new capacitance is:", options: ["KC", "C/K", "C", "K²C"], correct: 0, explanation: "With dielectric, C' = KC", difficulty: "EASY" },
  ],
  "Gauss Law": [
    { text: "The electric flux through a closed surface enclosing a charge Q is:", options: ["Q/ε₀", "Qε₀", "Q/4πε₀", "4πQ/ε₀"], correct: 0, explanation: "Gauss's law: φ = Q/ε₀", difficulty: "EASY" },
    { text: "A point charge Q is placed at the center of a cube. The flux through one face is:", options: ["Q/6ε₀", "Q/ε₀", "Q/4ε₀", "Q/2ε₀"], correct: 0, explanation: "By symmetry, flux through each face = total flux/6 = Q/6ε₀", difficulty: "MEDIUM" },
  ],
  "Reflection": [
    { text: "The image formed by a plane mirror is:", options: ["Virtual, erect, and same size as object", "Real, inverted, and same size", "Virtual, inverted, and smaller", "Real, erect, and magnified"], correct: 0, explanation: "Plane mirrors always form virtual, erect images of the same size as the object.", difficulty: "EASY" },
    { text: "Two plane mirrors are placed at 60° to each other. The number of images formed is:", options: ["5", "6", "4", "3"], correct: 0, explanation: "n = 360/θ - 1 = 360/60 - 1 = 6 - 1 = 5", difficulty: "MEDIUM" },
  ],
  "Refraction": [
    { text: "The refractive index of water is 4/3. The speed of light in water is: (c = 3×10⁸ m/s)", options: ["2.25×10⁸ m/s", "4×10⁸ m/s", "1.5×10⁸ m/s", "3×10⁸ m/s"], correct: 0, explanation: "v = c/n = 3×10⁸/(4/3) = 2.25×10⁸ m/s", difficulty: "EASY" },
    { text: "Critical angle for a medium with refractive index √2 is:", options: ["45°", "30°", "60°", "90°"], correct: 0, explanation: "sin C = 1/n = 1/√2. So C = 45°", difficulty: "MEDIUM" },
  ],
  "Wave Optics": [
    { text: "In Young's double slit experiment, the fringe width is:", options: ["λD/d", "λd/D", "Dd/λ", "λ/d"], correct: 0, explanation: "Fringe width β = λD/d", difficulty: "MEDIUM" },
    { text: "The minimum thickness of a soap film (μ=4/3) for strong reflection of light of wavelength 600 nm in air is:", options: ["112.5 nm", "225 nm", "450 nm", "600 nm"], correct: 0, explanation: "For constructive interference, 2μt = λ/2 => t = λ/(4μ) = 600/(4×4/3) = 112.5 nm", difficulty: "HARD" },
  ],
  "Lenses": [
    { text: "The power of a convex lens of focal length 20 cm is:", options: ["+5 D", "-5 D", "+0.05 D", "-0.05 D"], correct: 0, explanation: "P = 1/f(in m) = 1/0.2 = +5 D", difficulty: "EASY" },
    { text: "A concave lens of focal length 15 cm produces an image at 10 cm from the lens. The object distance is:", options: ["30 cm", "20 cm", "25 cm", "6 cm"], correct: 0, explanation: "Using lens formula: 1/f = 1/v - 1/u. -1/15 = -1/10 - 1/u => u = -30 cm", difficulty: "MEDIUM" },
  ],
  "Dispersion": [
    { text: "The splitting of white light into its constituent colors is called:", options: ["Dispersion", "Diffraction", "Interference", "Polarization"], correct: 0, explanation: "Dispersion is the phenomenon of splitting of white light into its component colors.", difficulty: "EASY" },
    { text: "The dispersive power of a prism material depends on:", options: ["The material of the prism", "The angle of the prism", "The angle of incidence", "The wavelength of light used"], correct: 0, explanation: "Dispersive power ω = (μᵥ - μᵣ)/(μᵧ - 1) depends only on the material.", difficulty: "MEDIUM" },
  ],
  "Photoelectric Effect": [
    { text: "The work function of a metal is 2 eV. The threshold wavelength is: (h = 6.63×10⁻³⁴ Js, c = 3×10⁸ m/s, 1 eV = 1.6×10⁻¹⁹ J)", options: ["620 nm", "310 nm", "1240 nm", "2480 nm"], correct: 0, explanation: "λ₀ = hc/φ = 1240/2 = 620 nm", difficulty: "MEDIUM" },
    { text: "The photoelectric effect demonstrates the _____ nature of light.", options: ["Particle", "Wave", "Both wave and particle", "Neither"], correct: 0, explanation: "Photoelectric effect proves the particle nature of light (photons).", difficulty: "EASY" },
    { text: "Increasing the frequency of incident light in photoelectric effect increases the:", options: ["Kinetic energy of photoelectrons", "Number of photoelectrons", "Both KE and number", "Neither"], correct: 0, explanation: "KE = hf - φ. Increasing frequency increases KE of emitted electrons.", difficulty: "MEDIUM" },
  ],
  "Atomic Models": [
    { text: "The radius of the first Bohr orbit of hydrogen atom is 0.529 Å. The radius of the third orbit is:", options: ["4.761 Å", "1.587 Å", "0.529 Å", "2.116 Å"], correct: 0, explanation: "rₙ = n²r₁ = 9×0.529 = 4.761 Å", difficulty: "MEDIUM" },
    { text: "The energy of the first excited state of hydrogen atom is:", options: ["-3.4 eV", "-13.6 eV", "-1.51 eV", "-0.85 eV"], correct: 0, explanation: "Eₙ = -13.6/n² eV. First excited state n=2: E = -13.6/4 = -3.4 eV", difficulty: "MEDIUM" },
    { text: "The wavelength of the first line of Balmer series is 6563 Å. The wavelength of the first line of Lyman series is:", options: ["1216 Å", "1026 Å", "4861 Å", "3646 Å"], correct: 0, explanation: "For Lyman series (n=2→1): 1/λ = R(1 - 1/4) = 3R/4. For Balmer (n=3→2): 1/6563 = R(1/4 - 1/9) = 5R/36. Dividing gives λ = 6563×5/27 ≈ 1216 Å", difficulty: "HARD" },
  ],
  "Nuclear Physics": [
    { text: "The half-life of a radioactive substance is 10 days. The time taken for 87.5% decay is:", options: ["30 days", "20 days", "40 days", "10 days"], correct: 0, explanation: "87.5% decay means 12.5% remains = 1/8 = (1/2)³. So 3 half-lives = 30 days.", difficulty: "MEDIUM" },
    { text: "The binding energy per nucleon is maximum for:", options: ["Iron (Fe)", "Uranium (U)", "Hydrogen (H)", "Helium (He)"], correct: 0, explanation: "Binding energy per nucleon peaks at iron (A≈56) at about 8.8 MeV.", difficulty: "HARD" },
    { text: "The missing particle in the reaction: ²³⁸₉₂U → ²³⁴₉₀Th + ___ is:", options: ["Alpha particle", "Beta particle", "Gamma ray", "Neutron"], correct: 0, explanation: "Mass number decreases by 4, atomic number by 2, so an alpha particle (⁴₂He) is emitted.", difficulty: "EASY" },
  ],
  "Semiconductors": [
    { text: "A p-type semiconductor is formed by doping silicon with:", options: ["Boron", "Phosphorus", "Arsenic", "Antimony"], correct: 0, explanation: "Boron is trivalent (3 valence electrons), creating holes (p-type).", difficulty: "EASY" },
    { text: "The barrier potential of a silicon PN junction is approximately:", options: ["0.7 V", "0.3 V", "1.4 V", "0 V"], correct: 0, explanation: "Silicon has a barrier potential of about 0.7 V (germanium ~0.3 V).", difficulty: "EASY" },
    { text: "In a common emitter transistor amplifier, the phase difference between input and output is:", options: ["180°", "0°", "90°", "270°"], correct: 0, explanation: "Common emitter amplifier produces 180° phase shift between input and output.", difficulty: "MEDIUM" },
  ],
  "Magnetic Fields": [
    { text: "The magnetic field at the center of a circular loop of radius R carrying current I is:", options: ["μ₀I/2R", "μ₀I/2πR", "μ₀I/R", "μ₀I/4πR²"], correct: 0, explanation: "B = μ₀I/2R at the center of a circular loop.", difficulty: "MEDIUM" },
    { text: "A charged particle moving perpendicular to a uniform magnetic field follows a:", options: ["Circular path", "Straight line", "Parabolic path", "Helical path"], correct: 0, explanation: "Force is perpendicular to velocity, providing centripetal force for circular motion.", difficulty: "EASY" },
  ],
  "EMI": [
    { text: "The SI unit of magnetic flux is:", options: ["Weber", "Tesla", "Henry", "Farad"], correct: 0, explanation: "Magnetic flux is measured in webers (Wb).", difficulty: "EASY" },
    { text: "A coil of 100 turns and area 0.1 m² is placed perpendicular to a magnetic field of 0.2 T. If the field is reduced to zero in 0.01 s, the induced emf is:", options: ["200 V", "20 V", "2 V", "2000 V"], correct: 0, explanation: "ε = -N(dφ/dt) = -100×(0-0.2×0.1)/0.01 = 100×0.02/0.01 = 200 V", difficulty: "MEDIUM" },
  ],
  "AC Circuits": [
    { text: "The RMS value of an AC voltage with peak value V₀ is:", options: ["V₀/√2", "V₀√2", "V₀/2", "2V₀"], correct: 0, explanation: "V_rms = V₀/√2 for sinusoidal AC.", difficulty: "EASY" },
    { text: "At resonance in an LCR series circuit, the impedance is:", options: ["Equal to R", "Zero", "Equal to ωL - 1/ωC", "Infinite"], correct: 0, explanation: "At resonance, ωL = 1/ωC, so impedance Z = R.", difficulty: "MEDIUM" },
  ],
  "Electromagnetic Waves": [
    { text: "The speed of electromagnetic waves in vacuum is:", options: ["3×10⁸ m/s", "3×10⁶ m/s", "3×10¹⁰ m/s", "3×10⁴ m/s"], correct: 0, explanation: "All EM waves travel at c = 3×10⁸ m/s in vacuum.", difficulty: "EASY" },
    { text: "Which of the following electromagnetic waves has the longest wavelength?", options: ["Radio waves", "X-rays", "Ultraviolet", "Gamma rays"], correct: 0, explanation: "Radio waves have the longest wavelength in the EM spectrum.", difficulty: "EASY" },
  ],
  "Simple Harmonic Motion": [
    { text: "A particle executes SHM with amplitude A and time period T. The maximum velocity is:", options: ["2πA/T", "4πA/T", "πA/T", "2πA/T²"], correct: 0, explanation: "v_max = Aω = 2πA/T", difficulty: "MEDIUM" },
    { text: "The displacement of a particle in SHM is x = A sin(ωt + φ). The acceleration is proportional to:", options: ["-x", "x", "v", "-v"], correct: 0, explanation: "a = -ω²x, acceleration is proportional to negative displacement.", difficulty: "EASY" },
    { text: "The length of a simple pendulum is increased by 44%. The increase in its time period is:", options: ["20%", "44%", "10%", "22%"], correct: 0, explanation: "T ∝ √L. If L increases by 44%, L' = 1.44L. T' = √1.44 × T = 1.2T. Increase = 20%", difficulty: "HARD" },
  ],
  "Wave Motion": [
    { text: "The speed of a wave on a stretched string depends on:", options: ["Tension and linear mass density", "Frequency and amplitude", "Wavelength and frequency", "Tension and frequency"], correct: 0, explanation: "v = √(T/μ), where T is tension and μ is linear mass density.", difficulty: "MEDIUM" },
    { text: "The equation of a progressive wave is y = 0.02 sin(2πt - 2πx/λ). The amplitude of the wave is:", options: ["0.02 m", "0.01 m", "2π m", "0.04 m"], correct: 0, explanation: "Amplitude is the coefficient of the sine function = 0.02 m.", difficulty: "EASY" },
  ],
  "Sound Waves": [
    { text: "The intensity level of a sound of intensity I is given by β = 10 log₁₀(I/I₀). If I = 100 I₀, the intensity level is:", options: ["20 dB", "10 dB", "100 dB", "50 dB"], correct: 0, explanation: "β = 10 log₁₀(100) = 10×2 = 20 dB", difficulty: "MEDIUM" },
    { text: "A source of frequency 500 Hz is moving towards a stationary observer at 30 m/s. The apparent frequency heard is: (v = 340 m/s)", options: ["548 Hz", "456 Hz", "500 Hz", "600 Hz"], correct: 0, explanation: "f' = f(v/(v-vs)) = 500(340/(340-30)) = 500(340/310) ≈ 548 Hz", difficulty: "MEDIUM" },
  ],
  "Doppler Effect": [
    { text: "In the Doppler effect, when a source moves away from a stationary observer, the observed frequency:", options: ["Decreases", "Increases", "Remains same", "Becomes zero"], correct: 0, explanation: "When source moves away, wavelength increases, frequency decreases.", difficulty: "EASY" },
    { text: "A train approaching a platform at 20 m/s sounds its horn (frequency 400 Hz). The frequency heard by a person on the platform is: (v = 340 m/s)", options: ["425 Hz", "400 Hz", "377 Hz", "450 Hz"], correct: 0, explanation: "f' = 400(340/(340-20)) = 400×340/320 = 425 Hz", difficulty: "MEDIUM" },
  ],
}

const chemistryQuestions: Record<string, QuestionData[]> = {
  "Mole Concept": [
    { text: "How many moles are present in 36 g of water? (H=1, O=16)", options: ["1 mol", "2 mol", "3 mol", "0.5 mol"], correct: 1, explanation: "Molar mass H₂O = 18 g/mol. Moles = 36/18 = 2 mol", difficulty: "EASY" },
    { text: "The number of atoms in 1 mole of carbon-12 is:", options: ["6.022×10²³", "3.011×10²³", "12.044×10²³", "6.022×10²²"], correct: 0, explanation: "Avogadro's number: 1 mole contains 6.022×10²³ particles.", difficulty: "EASY" },
    { text: "The mass of 2 moles of CaCO₃ is: (Ca=40, C=12, O=16)", options: ["200 g", "100 g", "150 g", "250 g"], correct: 0, explanation: "Molar mass CaCO₃ = 40+12+48 = 100 g/mol. Mass = 2×100 = 200 g", difficulty: "EASY" },
    { text: "The empirical formula of a compound containing 40% C, 6.67% H, and 53.33% O by mass is:", options: ["CH₂O", "C₂H₄O₂", "CHO", "CH₂O₂"], correct: 0, explanation: "C:H:O mole ratio = 40/12 : 6.67/1 : 53.33/16 = 3.33:6.67:3.33 = 1:2:1. So empirical formula = CH₂O", difficulty: "HARD" },
  ],
  "Atomic Structure": [
    { text: "The maximum number of electrons that can be accommodated in the L shell is:", options: ["8", "2", "18", "32"], correct: 0, explanation: "L shell (n=2) can hold 2n² = 2×4 = 8 electrons", difficulty: "EASY" },
    { text: "The azimuthal quantum number for the 3d orbital is:", options: ["2", "0", "1", "3"], correct: 0, explanation: "For d orbital, l = 2", difficulty: "MEDIUM" },
    { text: "According to Heisenberg's uncertainty principle, Δx × Δp ≥:", options: ["h/4π", "h/2π", "h", "h/π"], correct: 0, explanation: "Δx·Δp ≥ h/(4π)", difficulty: "MEDIUM" },
    { text: "The energy of an electron in the nth Bohr orbit of hydrogen is proportional to:", options: ["1/n²", "n²", "1/n", "n"], correct: 0, explanation: "Eₙ = -13.6/n² eV, so E ∝ 1/n²", difficulty: "MEDIUM" },
  ],
  "Chemical Bonding": [
    { text: "The type of bond formed by the sharing of electrons between atoms is called:", options: ["Covalent bond", "Ionic bond", "Metallic bond", "Hydrogen bond"], correct: 0, explanation: "Covalent bonds involve sharing of electron pairs between atoms.", difficulty: "EASY" },
    { text: "The shape of the NH₃ molecule is:", options: ["Trigonal pyramidal", "Trigonal planar", "Tetrahedral", "Linear"], correct: 0, explanation: "NH₃ has 3 bond pairs and 1 lone pair, giving a trigonal pyramidal shape.", difficulty: "MEDIUM" },
    { text: "The bond order of O₂ molecule is:", options: ["2", "2.5", "1.5", "3"], correct: 0, explanation: "MO configuration of O₂ gives bond order = (8-4)/2 = 2", difficulty: "HARD" },
    { text: "Which of the following has the highest dipole moment?", options: ["H₂O", "CO₂", "CH₄", "BF₃"], correct: 0, explanation: "H₂O has bent structure with net dipole. CO₂, CH₄, BF₃ are symmetric with zero dipole.", difficulty: "MEDIUM" },
  ],
  "Thermodynamics" : [
    { text: "The first law of thermodynamics is a statement of conservation of:", options: ["Energy", "Mass", "Momentum", "Charge"], correct: 0, explanation: "First law: ΔU = q + w, conservation of energy.", difficulty: "EASY" },
    { text: "The enthalpy change for the reaction H₂ + ½O₂ → H₂O(l) is called:", options: ["Enthalpy of formation of H₂O", "Enthalpy of combustion of H₂", "Enthalpy of neutralization", "Enthalpy of atomization"], correct: 0, explanation: "Enthalpy of formation is the heat change when 1 mole of compound is formed from its elements.", difficulty: "MEDIUM" },
    { text: "For a spontaneous process, the change in Gibbs free energy is:", options: ["Negative", "Positive", "Zero", "Cannot be determined"], correct: 0, explanation: "ΔG < 0 for spontaneous processes.", difficulty: "EASY" },
    { text: "The entropy of a perfectly crystalline solid at absolute zero is:", options: ["Zero", "Positive", "Negative", "Infinite"], correct: 0, explanation: "Third law: Entropy of perfectly crystalline solid at 0 K is zero.", difficulty: "MEDIUM" },
  ],
  "Equilibrium": [
    { text: "For the reaction H₂ + I₂ ⇌ 2HI, the equilibrium constant Kc is:", options: ["[HI]²/([H₂][I₂])", "[H₂][I₂]/[HI]²", "[HI]/([H₂][I₂])", "[H₂][I₂]/[HI]"], correct: 0, explanation: "Kc = [products]^coefficients/[reactants]^coefficients = [HI]²/([H₂][I₂])", difficulty: "EASY" },
    { text: "The pH of 0.001 M HCl solution is:", options: ["3", "11", "1", "7"], correct: 0, explanation: "[H⁺] = 10⁻³ M, pH = -log(10⁻³) = 3", difficulty: "EASY" },
    { text: "The solubility product of AgCl is 1.8×10⁻¹⁰. The solubility of AgCl in water is:", options: ["1.34×10⁻⁵ M", "1.8×10⁻¹⁰ M", "3.6×10⁻¹⁰ M", "9×10⁻¹¹ M"], correct: 0, explanation: "Ksp = s² => s = √(1.8×10⁻¹⁰) = 1.34×10⁻⁵ M", difficulty: "MEDIUM" },
    { text: "Le Chatelier's principle states that if a system at equilibrium is disturbed, the system will shift to:", options: ["Counteract the disturbance", "Amplify the disturbance", "Remain unchanged", "Reach a new equilibrium randomly"], correct: 0, explanation: "Le Chatelier's principle: system shifts to minimize the effect of the disturbance.", difficulty: "EASY" },
  ],
  "Kinetics": [
    { text: "The rate of a reaction depends on:", options: ["Concentration of reactants", "Temperature only", "Pressure only", "Volume only"], correct: 0, explanation: "Rate depends on concentration of reactants (rate law), temperature, and sometimes pressure.", difficulty: "EASY" },
    { text: "The half-life of a first-order reaction is 10 min. The time for 75% completion is:", options: ["20 min", "30 min", "40 min", "15 min"], correct: 0, explanation: "75% completion means 25% remains = (1/2)², so 2 half-lives = 20 min", difficulty: "MEDIUM" },
    { text: "The activation energy of a reaction can be determined using:", options: ["Arrhenius equation", "Van't Hoff equation", "Clausius-Clapeyron equation", "Nernst equation"], correct: 0, explanation: "Arrhenius equation: k = Ae⁻ᴱᵃ/ᴿᵀ links rate constant and activation energy.", difficulty: "MEDIUM" },
  ],
  "Electrochemistry": [
    { text: "The standard emf of the Daniell cell (Zn|Zn²⁺||Cu²⁺|Cu) is: (E°Zn²⁺/Zn = -0.76 V, E°Cu²⁺/Cu = +0.34 V)", options: ["1.10 V", "0.42 V", "1.44 V", "0.76 V"], correct: 0, explanation: "E°cell = E°cathode - E°anode = 0.34 - (-0.76) = 1.10 V", difficulty: "MEDIUM" },
    { text: "Faraday's law of electrolysis states that the mass of substance deposited is proportional to:", options: ["Quantity of electricity passed", "Time of electrolysis", "Temperature", "Volume of electrolyte"], correct: 0, explanation: "m = (Q/F)(M/z), mass is proportional to charge passed.", difficulty: "EASY" },
    { text: "The conductivity of an electrolyte solution depends on:", options: ["Nature of electrolyte and concentration", "Temperature only", "Pressure only", "Surface area of electrodes"], correct: 0, explanation: "Conductivity depends on ion type, concentration, and temperature.", difficulty: "MEDIUM" },
  ],
  "Hydrocarbons": [
    { text: "The general formula of alkanes is:", options: ["CₙH₂ₙ₊₂", "CₙH₂ₙ", "CₙH₂ₙ₋₂", "CₙH₂ₙ₊₁"], correct: 0, explanation: "Alkanes are saturated hydrocarbons with formula CₙH₂ₙ₊₂.", difficulty: "EASY" },
    { text: "Benzene undergoes which of the following reactions most readily?", options: ["Electrophilic substitution", "Nucleophilic substitution", "Addition", "Elimination"], correct: 0, explanation: "Benzene undergoes electrophilic aromatic substitution (e.g., nitration, halogenation).", difficulty: "MEDIUM" },
    { text: "Which of the following has the highest boiling point?", options: ["Hexane", "Heptane", "Pentane", "Butane"], correct: 1, explanation: "Boiling point increases with chain length due to increased van der Waals forces.", difficulty: "EASY" },
    { text: "The product of ozonolysis of ethene is:", options: ["Formaldehyde", "Acetaldehyde", "Carbon dioxide", "Ethanol"], correct: 0, explanation: "Ozonolysis of ethene gives 2 molecules of formaldehyde (HCHO).", difficulty: "HARD" },
  ],
  "Alcohols Phenols": [
    { text: "The functional group of alcohols is:", options: ["-OH", "-CHO", "-COOH", "-NH₂"], correct: 0, explanation: "Alcohols contain the hydroxyl (-OH) functional group.", difficulty: "EASY" },
    { text: "The IUPAC name of CH₃CH₂CH₂OH is:", options: ["Propan-1-ol", "Propan-2-ol", "Propanol", "Propyl alcohol"], correct: 0, explanation: "The longest chain is 3 carbons with -OH on carbon 1: propan-1-ol.", difficulty: "EASY" },
    { text: "Phenol is more acidic than ethanol because:", options: ["Phenoxide ion is resonance stabilized", "Phenol has higher molecular weight", "Phenol is aromatic", "Phenol has -OH group"], correct: 0, explanation: "The phenoxide ion is stabilized by resonance with the benzene ring, making phenol more acidic.", difficulty: "MEDIUM" },
  ],
  "Aldehydes Ketones": [
    { text: "The functional group of aldehydes is:", options: ["-CHO", "-CO-", "-COOH", "-OH"], correct: 0, explanation: "Aldehydes have the -CHO group (carbonyl at the end of carbon chain).", difficulty: "EASY" },
    { text: "Tollens' reagent is used to test for:", options: ["Aldehydes", "Ketones", "Carboxylic acids", "Alcohols"], correct: 0, explanation: "Tollens' reagent (ammoniacal silver nitrate) oxidizes aldehydes, forming a silver mirror.", difficulty: "MEDIUM" },
    { text: "The product of reduction of propanal with NaBH₄ is:", options: ["Propan-1-ol", "Propane", "Propan-2-ol", "Propanoic acid"], correct: 0, explanation: "NaBH₄ reduces aldehydes to primary alcohols. Propanal → Propan-1-ol.", difficulty: "MEDIUM" },
  ],
  "Carboxylic Acids": [
    { text: "The functional group of carboxylic acids is:", options: ["-COOH", "-COO-", "-CONH₂", "-COCl"], correct: 0, explanation: "Carboxylic acids contain the carboxyl group (-COOH).", difficulty: "EASY" },
    { text: "The IUPAC name of CH₃COOH is:", options: ["Ethanoic acid", "Acetic acid", "Methanoic acid", "Propanoic acid"], correct: 0, explanation: "CH₃COOH has 2 carbons: ethanoic acid (acetic acid is the common name).", difficulty: "EASY" },
    { text: "The product of reaction of acetic acid with ethanol in presence of H₂SO₄ is:", options: ["Ethyl acetate", "Ethyl ethanoate", "Ethyl alcohol", "Ethane"], correct: 0, explanation: "Esterification: CH₃COOH + C₂H₅OH → CH₃COOC₂H₅ + H₂O. Common name: ethyl acetate.", difficulty: "MEDIUM" },
  ],
  "Amines": [
    { text: "The functional group of amines is:", options: ["-NH₂", "-NO₂", "-CN", "-CONH₂"], correct: 0, explanation: "Amines contain the amino group (-NH₂).", difficulty: "EASY" },
    { text: "The hybridization of nitrogen in aniline is:", options: ["sp²", "sp³", "sp", "dsp²"], correct: 0, explanation: "In aniline, the lone pair on N is conjugated with the benzene ring, giving sp² hybridization.", difficulty: "HARD" },
    { text: "Primary amines react with nitrous acid to give:", options: ["Alcohols and N₂ gas", "Nitro compounds", "Diazonium salts", "Amides"], correct: 0, explanation: "RNH₂ + HNO₂ → ROH + N₂ + H₂O. Primary aliphatic amines give alcohols and N₂.", difficulty: "MEDIUM" },
  ],
  "Biomolecules": [
    { text: "The monomer of proteins is:", options: ["Amino acids", "Monosaccharides", "Nucleotides", "Fatty acids"], correct: 0, explanation: "Proteins are polymers of amino acids linked by peptide bonds.", difficulty: "EASY" },
    { text: "Glucose and fructose are examples of:", options: ["Monosaccharides", "Disaccharides", "Polysaccharides", "Oligosaccharides"], correct: 0, explanation: "Monosaccharides are the simplest sugars. Glucose and fructose have formula C₆H₁₂O₆.", difficulty: "EASY" },
    { text: "The double helical structure of DNA was discovered by:", options: ["Watson and Crick", "Mendel", "Darwin", "Pauling"], correct: 0, explanation: "Watson and Crick proposed the double helix structure of DNA in 1953.", difficulty: "EASY" },
  ],
  "Polymers": [
    { text: "The monomer of polythene is:", options: ["Ethene", "Propene", "Styrene", "Vinyl chloride"], correct: 0, explanation: "Polythene (polyethylene) is polymerized from ethene (ethylene) monomers.", difficulty: "EASY" },
    { text: "Nylon-6,6 is a condensation polymer of:", options: ["Hexamethylene diamine and adipic acid", "Caprolactam", "Terephthalic acid and ethylene glycol", "Vinyl chloride"], correct: 0, explanation: "Nylon-6,6 is made from hexamethylene diamine and adipic acid.", difficulty: "MEDIUM" },
    { text: "Natural rubber is a polymer of:", options: ["Isoprene", "Chloroprene", "Neoprene", "Styrene"], correct: 0, explanation: "Natural rubber (polyisoprene) is polymerized from isoprene (2-methyl-1,3-butadiene).", difficulty: "MEDIUM" },
  ],
  "Periodic Table": [
    { text: "The most electronegative element is:", options: ["Fluorine", "Oxygen", "Chlorine", "Nitrogen"], correct: 0, explanation: "Fluorine has the highest electronegativity (≈4.0 on Pauling scale).", difficulty: "EASY" },
    { text: "The element with the highest ionization energy is:", options: ["Helium", "Neon", "Argon", "Krypton"], correct: 0, explanation: "Helium has the highest ionization energy due to its small size and stable electron configuration.", difficulty: "MEDIUM" },
    { text: "Modern periodic law states that properties of elements depend on their:", options: ["Atomic number", "Atomic mass", "Neutron number", "Mass number"], correct: 0, explanation: "Moseley's modern periodic law: properties are periodic functions of atomic number.", difficulty: "EASY" },
  ],
  "s-block Elements": [
    { text: "Alkali metals have how many valence electrons?", options: ["1", "2", "3", "7"], correct: 0, explanation: "Alkali metals (Group 1) have 1 valence electron (ns¹ configuration).", difficulty: "EASY" },
    { text: "Which alkali metal is the most reactive?", options: ["Francium", "Cesium", "Potassium", "Sodium"], correct: 0, explanation: "Reactivity increases down the group. Francium is most reactive but radioactive. Among stable ones, cesium.", difficulty: "MEDIUM" },
    { text: "The solubility of hydroxides of alkaline earth metals:", options: ["Increases down the group", "Decreases down the group", "Remains same", "Shows irregular trend"], correct: 0, explanation: "Solubility of M(OH)₂ increases down the group due to increasing ionic character.", difficulty: "HARD" },
  ],
  "p-block Elements": [
    { text: "The most abundant element in Earth's crust is:", options: ["Oxygen", "Silicon", "Aluminum", "Iron"], correct: 0, explanation: "Oxygen (46.6%) is the most abundant element in Earth's crust.", difficulty: "EASY" },
    { text: "The inertness of noble gases is due to:", options: ["Complete octet configuration", "High ionization energy", "Low electron affinity", "All of these"], correct: 3, explanation: "Noble gases have complete octet, high IE, and low EA, making them chemically inert.", difficulty: "EASY" },
    { text: "In group 15 elements, the stability of hydrides (NH₃, PH₃, AsH₃, SbH₃) decreases due to:", options: ["Decreasing bond dissociation energy", "Increasing size", "Decreasing electronegativity", "Increasing bond angle"], correct: 0, explanation: "Bond dissociation energy decreases down the group, making hydrides less stable.", difficulty: "HARD" },
  ],
  "d-block Elements": [
    { text: "The general electronic configuration of d-block elements is:", options: ["(n-1)d¹⁻¹⁰ ns¹⁻²", "ns²np¹⁻⁶", "(n-1)f¹⁻¹⁴ ns²", "ns¹⁻²"], correct: 0, explanation: "Transition metals have configuration (n-1)d¹⁻¹⁰ ns¹⁻².", difficulty: "MEDIUM" },
    { text: "Which of the following is NOT a transition element?", options: ["Zn", "Fe", "Cu", "Ni"], correct: 0, explanation: "Zn has completely filled d¹⁰ configuration and doesn't show typical transition metal properties.", difficulty: "MEDIUM" },
    { text: "The catalytic activity of transition metals is due to:", options: ["Variable oxidation states and d-orbital involvement", "High melting points", "High density", "Metallic luster"], correct: 0, explanation: "Variable oxidation states and ability to form complexes make them good catalysts.", difficulty: "MEDIUM" },
  ],
  "Coordination Compounds": [
    { text: "The coordination number of Ni in [Ni(NH₃)₆]²⁺ is:", options: ["6", "4", "2", "3"], correct: 0, explanation: "There are 6 ammonia ligands coordinated to Ni, so coordination number = 6.", difficulty: "EASY" },
    { text: "The oxidation state of Fe in [Fe(CN)₆]⁴⁻ is:", options: ["+2", "+3", "+1", "0"], correct: 0, explanation: "CN⁻ has charge -1. 6 CN⁻ = -6. Total charge -4. So Fe = +2.", difficulty: "MEDIUM" },
    { text: "Which of the following ligands is an example of a chelating ligand?", options: ["EDTA", "H₂O", "NH₃", "Cl⁻"], correct: 0, explanation: "EDTA has 6 donor atoms and can form multiple coordinate bonds (hexadentate chelating ligand).", difficulty: "MEDIUM" },
  ],
  "Metallurgy": [
    { text: "The process of converting sulphide ores to oxides by heating in excess air is called:", options: ["Roasting", "Calcination", "Smelting", "Leaching"], correct: 0, explanation: "Roasting: heating sulphide ores in excess air to convert to oxides and SO₂.", difficulty: "MEDIUM" },
    { text: "The most abundant metal in Earth's crust is:", options: ["Aluminum", "Iron", "Copper", "Sodium"], correct: 0, explanation: "Aluminum is the most abundant metal (8.2% of Earth's crust by mass).", difficulty: "EASY" },
    { text: "The method used for purification of copper is:", options: ["Electrolytic refining", "Distillation", "Fractional crystallization", "Chromatography"], correct: 0, explanation: "Copper is purified by electrolytic refining with impure copper as anode.", difficulty: "EASY" },
  ],
}

const mathematicsQuestions: Record<string, QuestionData[]> = {
  "Sets Relations": [
    { text: "If A = {1,2,3} and B = {2,3,4}, then A∪B is:", options: ["{1,2,3,4}", "{2,3}", "{1,2,3}", "{1,4}"], correct: 0, explanation: "Union combines all elements: A∪B = {1,2,3,4}", difficulty: "EASY" },
    { text: "The number of subsets of a set with n elements is:", options: ["2ⁿ", "n²", "2n", "n!"], correct: 0, explanation: "A set with n elements has 2ⁿ subsets including the empty set.", difficulty: "EASY" },
    { text: "If R is an equivalence relation on set A, then it is:", options: ["Reflexive, symmetric, and transitive", "Reflexive and symmetric only", "Symmetric and transitive only", "Only transitive"], correct: 0, explanation: "An equivalence relation must be reflexive, symmetric, and transitive.", difficulty: "EASY" },
  ],
  "Complex Numbers": [
    { text: "The value of i¹⁰ is:", options: ["-1", "1", "i", "-i"], correct: 0, explanation: "i² = -1, i⁴ = 1. i¹⁰ = (i⁴)² × i² = 1 × (-1) = -1", difficulty: "EASY" },
    { text: "If z = 3 + 4i, then |z| is:", options: ["5", "7", "25", "1"], correct: 0, explanation: "|z| = √(3² + 4²) = √(9+16) = √25 = 5", difficulty: "EASY" },
    { text: "The complex number (1 + i)/(1 - i) is equal to:", options: ["i", "-i", "1", "-1"], correct: 0, explanation: "(1+i)/(1-i) = (1+i)²/(1-i)(1+i) = (1+2i-1)/(1+1) = 2i/2 = i", difficulty: "MEDIUM" },
    { text: "amp(i) is equal to:", options: ["π/2", "0", "π", "-π/2"], correct: 0, explanation: "i = 0 + 1i = cos(π/2) + i sin(π/2), so argument = π/2", difficulty: "MEDIUM" },
  ],
  "Quadratic Equations": [
    { text: "The discriminant of x² - 5x + 6 = 0 is:", options: ["1", "25", "-1", "49"], correct: 0, explanation: "D = b² - 4ac = 25 - 24 = 1", difficulty: "EASY" },
    { text: "The sum of roots of x² - 7x + 12 = 0 is:", options: ["7", "12", "-7", "-12"], correct: 0, explanation: "Sum = -b/a = 7", difficulty: "EASY" },
    { text: "If the roots of x² - kx + 9 = 0 are equal, then k =", options: ["±6", "±3", "±9", "±12"], correct: 0, explanation: "For equal roots, D = 0 => k² - 36 = 0 => k = ±6", difficulty: "MEDIUM" },
    { text: "The value of α for which the equation αx² + 2x + 1 = 0 has real roots is:", options: ["α ≤ 1", "α ≥ 1", "α < 1", "α > 1"], correct: 0, explanation: "D ≥ 0 => 4 - 4α ≥ 0 => α ≤ 1", difficulty: "MEDIUM" },
  ],
  "Sequences Series": [
    { text: "The nth term of an AP is 3n+2. The common difference is:", options: ["3", "2", "5", "1"], correct: 0, explanation: "aₙ = 3n+2, aₙ₊₁ = 3(n+1)+2 = 3n+5. Difference = 3.", difficulty: "EASY" },
    { text: "The sum of first n natural numbers is:", options: ["n(n+1)/2", "n²", "n(n+1)(2n+1)/6", "n(n-1)/2"], correct: 0, explanation: "Σn = n(n+1)/2", difficulty: "EASY" },
    { text: "The sum to infinity of the GP 1 + 1/2 + 1/4 + 1/8 + ... is:", options: ["2", "1", "3/2", "4/3"], correct: 0, explanation: "S∞ = a/(1-r) = 1/(1-1/2) = 2", difficulty: "EASY" },
  ],
  "Binomial Theorem": [
    { text: "The number of terms in the expansion of (x + a)ⁿ is:", options: ["n+1", "n", "2n", "n-1"], correct: 0, explanation: "The binomial expansion of (x+a)ⁿ has n+1 terms.", difficulty: "EASY" },
    { text: "The coefficient of x³ in (1 + x)⁶ is:", options: ["20", "6", "15", "10"], correct: 0, explanation: "Coefficient = ⁶C₃ = 6!/(3!3!) = 20", difficulty: "MEDIUM" },
    { text: "The middle term in the expansion of (x + 1/x)⁶ is:", options: ["20", "15", "30", "10"], correct: 0, explanation: "Middle term = T₄ = ⁶C₃ x³(1/x)³ = 20", difficulty: "MEDIUM" },
  ],
  "Permutations Combinations": [
    { text: "The value of 5! is:", options: ["120", "60", "24", "720"], correct: 0, explanation: "5! = 5×4×3×2×1 = 120", difficulty: "EASY" },
    { text: "The number of ways to arrange 4 distinct books on a shelf is:", options: ["24", "16", "4", "256"], correct: 0, explanation: "4! = 24 ways", difficulty: "EASY" },
    { text: "The number of ways to select 3 students from a group of 10 is:", options: ["120", "720", "30", "1000"], correct: 0, explanation: "¹⁰C₃ = 10!/(7!3!) = 120", difficulty: "MEDIUM" },
    { text: "In how many ways can the letters of the word 'MATH' be arranged?", options: ["24", "12", "6", "48"], correct: 0, explanation: "4 distinct letters: 4! = 24 arrangements", difficulty: "EASY" },
  ],
  "Matrices Determinants": [
    { text: "If A = [[1,2],[3,4]], then |A| is:", options: ["-2", "2", "10", "4"], correct: 0, explanation: "|A| = 1×4 - 2×3 = 4 - 6 = -2", difficulty: "EASY" },
    { text: "The value of the determinant |[a,b],[c,d]| is:", options: ["ad - bc", "ab - cd", "ac - bd", "ad + bc"], correct: 0, explanation: "|A| = ad - bc for a 2×2 matrix.", difficulty: "EASY" },
    { text: "The product of a matrix and its inverse is:", options: ["Identity matrix", "Zero matrix", "The matrix itself", "Scalar matrix"], correct: 0, explanation: "A·A⁻¹ = A⁻¹·A = I (identity matrix).", difficulty: "EASY" },
    { text: "If A is a 3×3 matrix and |A| = 5, then |2A| is:", options: ["40", "10", "20", "32"], correct: 0, explanation: "|kA| = kⁿ|A| for n×n matrix. |2A| = 8×5 = 40", difficulty: "MEDIUM" },
  ],
  "Limits Continuity": [
    { text: "lim(x→0) sin x / x is:", options: ["1", "0", "∞", "-1"], correct: 0, explanation: "This is a standard limit: lim(x→0) sin x / x = 1", difficulty: "EASY" },
    { text: "lim(x→0) (1 - cos x)/x² is:", options: ["1/2", "0", "1", "∞"], correct: 0, explanation: "lim(x→0) (1-cos x)/x² = lim(2sin²(x/2))/x² = (1/2)lim(sin(x/2)/(x/2))² = 1/2", difficulty: "MEDIUM" },
    { text: "lim(x→∞) (1 + 1/x)ˣ is:", options: ["e", "1", "∞", "0"], correct: 0, explanation: "This is the definition of e: lim(x→∞) (1 + 1/x)ˣ = e", difficulty: "MEDIUM" },
  ],
  "Differentiation": [
    { text: "If f(x) = x³, then f'(x) is:", options: ["3x²", "x²", "3x", "x⁴/4"], correct: 0, explanation: "d/dx(xⁿ) = nxⁿ⁻¹, so d/dx(x³) = 3x²", difficulty: "EASY" },
    { text: "If f(x) = sin x, then f'(x) is:", options: ["cos x", "-cos x", "sec²x", "-sin x"], correct: 0, explanation: "d/dx(sin x) = cos x", difficulty: "EASY" },
    { text: "If y = eˣ sin x, then dy/dx is:", options: ["eˣ(sin x + cos x)", "eˣcos x", "eˣ sin x", "eˣ(sin x - cos x)"], correct: 0, explanation: "Using product rule: dy/dx = eˣcos x + eˣsin x = eˣ(sin x + cos x)", difficulty: "MEDIUM" },
    { text: "If y = log(sec x), then dy/dx is:", options: ["tan x", "sec x", "sec x tan x", "cot x"], correct: 0, explanation: "dy/dx = (1/sec x)(sec x tan x) = tan x", difficulty: "HARD" },
  ],
  "Application of Derivatives": [
    { text: "The slope of the tangent to y = x² at x = 2 is:", options: ["4", "2", "1", "0"], correct: 0, explanation: "dy/dx = 2x. At x = 2, slope = 4", difficulty: "EASY" },
    { text: "The function f(x) = x³ - 3x² + 2x is increasing when:", options: ["x < 1/3 or x > 1", "x > 1", "x < 1/3", "1/3 < x < 1"], correct: 0, explanation: "f'(x) = 3x² - 6x + 2. f'(x) > 0 when x < 1/3 or x > 1", difficulty: "HARD" },
    { text: "The maximum value of sin x + cos x in [0, π/2] is:", options: ["√2", "1", "2", "0"], correct: 0, explanation: "Max of sin x + cos x = √2 at x = π/4", difficulty: "MEDIUM" },
  ],
  "Integration": [
    { text: "∫x²dx is:", options: ["x³/3 + C", "x³ + C", "2x + C", "x²/2 + C"], correct: 0, explanation: "∫xⁿdx = xⁿ⁺¹/(n+1) + C. ∫x²dx = x³/3 + C", difficulty: "EASY" },
    { text: "∫sin x dx is:", options: ["-cos x + C", "cos x + C", "tan x + C", "sec x + C"], correct: 0, explanation: "∫sin x dx = -cos x + C", difficulty: "EASY" },
    { text: "∫₀¹ x²dx is:", options: ["1/3", "1", "2/3", "1/2"], correct: 0, explanation: "∫₀¹ x²dx = [x³/3]₀¹ = 1/3", difficulty: "EASY" },
    { text: "∫eˣ dx is:", options: ["eˣ + C", "eˣ + x + C", "xeˣ + C", "eˣ/x + C"], correct: 0, explanation: "∫eˣ dx = eˣ + C", difficulty: "EASY" },
  ],
  "Differential Equations": [
    { text: "The order of the differential equation d²y/dx² + 3dy/dx + 2y = 0 is:", options: ["2", "1", "0", "3"], correct: 0, explanation: "The highest derivative is d²y/dx², so order = 2", difficulty: "EASY" },
    { text: "The degree of the differential equation (d²y/dx²)² + dy/dx = 0 is:", options: ["2", "1", "0", "3"], correct: 0, explanation: "The highest derivative (order 2) is raised to power 2, so degree = 2", difficulty: "MEDIUM" },
    { text: "The solution of dy/dx = 2x is:", options: ["y = x² + C", "y = 2x + C", "y = x²/2 + C", "y = 2x² + C"], correct: 0, explanation: "∫dy = ∫2x dx => y = x² + C", difficulty: "EASY" },
  ],
  "Area Under Curve": [
    { text: "The area bounded by y = x², x-axis, and x = 0 to x = 1 is:", options: ["1/3 sq units", "1 sq unit", "2 sq units", "1/2 sq unit"], correct: 0, explanation: "A = ∫₀¹ x²dx = [x³/3]₀¹ = 1/3", difficulty: "MEDIUM" },
    { text: "The area between y = x² and y = x from x = 0 to x = 1 is:", options: ["1/6 sq units", "1/3 sq units", "1/2 sq units", "1 sq unit"], correct: 0, explanation: "A = ∫₀¹ (x - x²)dx = [x²/2 - x³/3]₀¹ = 1/2 - 1/3 = 1/6", difficulty: "HARD" },
    { text: "The area of the circle x² + y² = a² is:", options: ["πa²", "2πa²", "πa²/2", "4πa²"], correct: 0, explanation: "Area of circle = πa²", difficulty: "EASY" },
  ],
  "Straight Lines": [
    { text: "The slope of the line 3x + 4y = 12 is:", options: ["-3/4", "3/4", "-4/3", "4/3"], correct: 0, explanation: "3x + 4y = 12 => y = -3x/4 + 3. Slope = -3/4", difficulty: "EASY" },
    { text: "The distance between (1,2) and (4,6) is:", options: ["5", "3", "4", "7"], correct: 0, explanation: "d = √((4-1)² + (6-2)²) = √(9+16) = √25 = 5", difficulty: "EASY" },
    { text: "The equation of a line passing through (2,3) with slope 4 is:", options: ["y - 3 = 4(x - 2)", "y + 3 = 4(x + 2)", "y = 4x + 3", "y - 2 = 4(x - 3)"], correct: 0, explanation: "Point-slope form: y - y₁ = m(x - x₁) => y - 3 = 4(x - 2)", difficulty: "EASY" },
  ],
  "Circles": [
    { text: "The equation of a circle with center (0,0) and radius 5 is:", options: ["x² + y² = 25", "x² + y² = 5", "(x-5)² + (y-5)² = 25", "x² + y² = 10"], correct: 0, explanation: "For center at origin: x² + y² = r² = 25", difficulty: "EASY" },
    { text: "The center of the circle x² + y² - 4x + 6y - 3 = 0 is:", options: ["(2,-3)", "(-2,3)", "(4,-6)", "(-4,6)"], correct: 0, explanation: "Center = (-g,-f) where 2g=-4, 2f=6. So g=-2, f=3. Center = (2,-3)", difficulty: "MEDIUM" },
    { text: "The length of the tangent from point (3,4) to the circle x² + y² = 9 is:", options: ["4", "3", "5", "2"], correct: 0, explanation: "Length of tangent = √(S₁) = √(9+16-9) = √16 = 4", difficulty: "HARD" },
  ],
  "Conic Sections": [
    { text: "The eccentricity of a parabola is:", options: ["1", "0", ">1", "<1"], correct: 0, explanation: "For a parabola, eccentricity e = 1", difficulty: "EASY" },
    { text: "The eccentricity of an ellipse is:", options: ["Less than 1", "Greater than 1", "Equal to 1", "Zero"], correct: 0, explanation: "For ellipse, 0 < e < 1", difficulty: "EASY" },
    { text: "The focus of the parabola y² = 4ax is:", options: ["(a,0)", "(0,a)", "(-a,0)", "(0,-a)"], correct: 0, explanation: "For parabola y² = 4ax, focus is at (a,0)", difficulty: "MEDIUM" },
  ],
  "Parabola": [
    { text: "The directrix of the parabola y² = 4ax is:", options: ["x + a = 0", "x - a = 0", "y + a = 0", "y - a = 0"], correct: 0, explanation: "Directrix of y² = 4ax is x = -a, or x + a = 0", difficulty: "MEDIUM" },
    { text: "The length of latus rectum of y² = 12x is:", options: ["12", "6", "3", "24"], correct: 0, explanation: "4a = 12, so latus rectum = 12", difficulty: "MEDIUM" },
  ],
  "Ellipse": [
    { text: "The equation of an ellipse with major axis along x-axis is:", options: ["x²/a² + y²/b² = 1", "x²/a² - y²/b² = 1", "x² + y² = a²", "y² = 4ax"], correct: 0, explanation: "Standard ellipse equation: x²/a² + y²/b² = 1 (a > b)", difficulty: "EASY" },
    { text: "For ellipse x²/25 + y²/16 = 1, the length of major axis is:", options: ["10", "8", "5", "4"], correct: 0, explanation: "a² = 25 => a = 5. Major axis = 2a = 10", difficulty: "MEDIUM" },
  ],
  "Hyperbola": [
    { text: "The eccentricity of a rectangular hyperbola is:", options: ["√2", "2", "1", "√3"], correct: 0, explanation: "For rectangular hyperbola, a = b, so e = √(1 + b²/a²) = √2", difficulty: "HARD" },
    { text: "The equation of hyperbola with foci on x-axis is:", options: ["x²/a² - y²/b² = 1", "x²/a² + y²/b² = 1", "x² - y² = a²", "xy = c²"], correct: 0, explanation: "Standard hyperbola: x²/a² - y²/b² = 1", difficulty: "MEDIUM" },
  ],
  "Probability Basics": [
    { text: "The probability of getting a head when tossing a fair coin is:", options: ["1/2", "1", "0", "1/4"], correct: 0, explanation: "P(head) = 1/2 for a fair coin", difficulty: "EASY" },
    { text: "A fair die is rolled. The probability of getting a number greater than 4 is:", options: ["1/3", "1/2", "2/3", "1/6"], correct: 0, explanation: "Numbers >4 are 5,6. P = 2/6 = 1/3", difficulty: "EASY" },
    { text: "The probability of drawing a king from a standard deck of 52 cards is:", options: ["1/13", "1/52", "4/13", "1/4"], correct: 0, explanation: "There are 4 kings in 52 cards. P = 4/52 = 1/13", difficulty: "EASY" },
    { text: "If P(A) = 0.4 and P(B) = 0.5 and events are independent, P(A∩B) is:", options: ["0.2", "0.9", "0.1", "0.45"], correct: 0, explanation: "For independent events, P(A∩B) = P(A)×P(B) = 0.4×0.5 = 0.2", difficulty: "MEDIUM" },
  ],
  "Conditional Probability": [
    { text: "If P(A) = 1/3, P(B) = 1/2, P(A∩B) = 1/6, then P(A|B) is:", options: ["1/3", "1/2", "1/6", "2/3"], correct: 0, explanation: "P(A|B) = P(A∩B)/P(B) = (1/6)/(1/2) = 1/3", difficulty: "MEDIUM" },
    { text: "Two events A and B are independent. P(A) = 0.3, P(B) = 0.4. P(A∪B) is:", options: ["0.58", "0.7", "0.12", "0.82"], correct: 0, explanation: "P(A∪B) = P(A)+P(B)-P(A∩B) = 0.3+0.4-0.12 = 0.58", difficulty: "MEDIUM" },
  ],
  "Random Variables": [
    { text: "A random variable X has values 0,1,2 with probabilities 0.2, 0.5, 0.3. E(X) is:", options: ["1.1", "1", "0.5", "1.5"], correct: 0, explanation: "E(X) = 0×0.2 + 1×0.5 + 2×0.3 = 0 + 0.5 + 0.6 = 1.1", difficulty: "MEDIUM" },
    { text: "The variance of a random variable with E(X²) = 5 and [E(X)]² = 4 is:", options: ["1", "9", "20", "5/4"], correct: 0, explanation: "Var(X) = E(X²) - [E(X)]² = 5 - 4 = 1", difficulty: "MEDIUM" },
  ],
  "Bayes Theorem": [
    { text: "Box A has 2 red, 3 blue balls. Box B has 4 red, 1 blue ball. A box is chosen at random and a red ball is drawn. The probability it came from Box A is:", options: ["1/3", "2/3", "1/2", "3/5"], correct: 0, explanation: "P(A|R) = (1/2×2/5)/(1/2×2/5 + 1/2×4/5) = (1/5)/(3/5) = 1/3", difficulty: "HARD" },
    { text: "A test detects a disease with 95% accuracy. 1% of the population has the disease. If a person tests positive, the probability they actually have the disease is approximately:", options: ["16%", "95%", "1%", "84%"], correct: 0, explanation: "P(D|+) = (0.01×0.95)/(0.01×0.95 + 0.99×0.05) ≈ 0.0095/0.059 ≈ 0.16 = 16%", difficulty: "HARD" },
  ],
  "Trigonometric Functions": [
    { text: "The value of sin 30° is:", options: ["1/2", "√3/2", "1/√2", "0"], correct: 0, explanation: "sin 30° = 1/2", difficulty: "EASY" },
    { text: "The value of tan 45° is:", options: ["1", "0", "∞", "√3"], correct: 0, explanation: "tan 45° = 1", difficulty: "EASY" },
    { text: "sin²θ + cos²θ =", options: ["1", "0", "sin 2θ", "sec²θ"], correct: 0, explanation: "This is the fundamental trigonometric identity: sin²θ + cos²θ = 1", difficulty: "EASY" },
    { text: "The period of sin x is:", options: ["2π", "π", "π/2", "4π"], correct: 0, explanation: "sin(x + 2π) = sin x, so period = 2π", difficulty: "EASY" },
  ],
  "Inverse Trigonometry": [
    { text: "The principal value of sin⁻¹(1/2) is:", options: ["π/6", "π/3", "π/4", "π/2"], correct: 0, explanation: "sin(π/6) = 1/2, so sin⁻¹(1/2) = π/6", difficulty: "EASY" },
    { text: "The value of tan⁻¹(1) is:", options: ["π/4", "π/2", "π/3", "0"], correct: 0, explanation: "tan(π/4) = 1, so tan⁻¹(1) = π/4", difficulty: "EASY" },
    { text: "The domain of sin⁻¹x is:", options: ["[-1,1]", "(-1,1)", "[-π/2,π/2]", "All real numbers"], correct: 0, explanation: "sin⁻¹x is defined for x ∈ [-1,1]", difficulty: "MEDIUM" },
  ],
  "Trigonometric Equations": [
    { text: "The general solution of sin θ = 0 is:", options: ["θ = nπ", "θ = (2n+1)π/2", "θ = nπ/2", "θ = 2nπ"], correct: 0, explanation: "sin θ = 0 when θ = nπ, n ∈ Z", difficulty: "MEDIUM" },
    { text: "The general solution of cos θ = 1 is:", options: ["θ = 2nπ", "θ = nπ", "θ = (2n+1)π/2", "θ = (2n+1)π"], correct: 0, explanation: "cos θ = 1 when θ = 2nπ, n ∈ Z", difficulty: "MEDIUM" },
  ],
  "Heights Distances": [
    { text: "A tower makes an angle of elevation of 30° at a point 100 m from its base. The height of the tower is:", options: ["100/√3 m", "100√3 m", "50 m", "200 m"], correct: 0, explanation: "tan 30° = h/100 => h = 100/√3 m", difficulty: "MEDIUM" },
    { text: "The angle of elevation of the top of a building from a point 50 m away is 45°. The height of the building is:", options: ["50 m", "50√3 m", "25 m", "100 m"], correct: 0, explanation: "tan 45° = h/50 => h = 50 m", difficulty: "MEDIUM" },
  ],
}

function getQuestions(subject: string, topic: string): QuestionData[] {
  if (subject === "Physics") return physicsQuestions[topic] || []
  if (subject === "Chemistry") return chemistryQuestions[topic] || []
  if (subject === "Mathematics") return mathematicsQuestions[topic] || []
  return []
}

async function main() {
  console.log("Seeding database with engineering entrance exam questions...")

  // Database is clean after reset - no deleteMany needed

  const adminPassword = await bcrypt.hash("admin123", 12)
  const admin = await prisma.admin.upsert({
    where: { email: "admin@epx.com" },
    update: {},
    create: { email: "admin@epx.com", password: adminPassword, name: "Admin" },
  })
  console.log("Admin created:", admin.email)

  const studentPassword = await bcrypt.hash("student123", 12)
  const student = await prisma.user.upsert({
    where: { email: "student@epx.com" },
    update: {},
    create: {
      email: "student@epx.com",
      password: studentPassword,
      name: "Demo Student",
      username: "demostudent",
      role: "STUDENT",
      targetExam: "JEE_MAIN",
      preferredSubjects: ["Physics", "Chemistry", "Mathematics"],
    },
  })
  console.log("Demo student created:", student.email)

  const testDefs = [
    { name: "JEE Main Physics Mock Test 1", examType: "JEE_MAIN" as const, subject: "Physics", duration: 60, totalQuestions: 25, difficulty: "MEDIUM" as const, description: "JEE Main Physics — 25 questions covering Mechanics, Thermodynamics, Electricity & Magnetism" },
    { name: "JEE Main Chemistry Mock Test 1", examType: "JEE_MAIN" as const, subject: "Chemistry", duration: 60, totalQuestions: 25, difficulty: "MEDIUM" as const, description: "JEE Main Chemistry — 25 questions covering Physical, Organic, and Inorganic Chemistry" },
    { name: "JEE Main Mathematics Mock Test 1", examType: "JEE_MAIN" as const, subject: "Mathematics", duration: 60, totalQuestions: 25, difficulty: "MEDIUM" as const, description: "JEE Main Mathematics — 25 questions covering Algebra, Calculus, and Coordinate Geometry" },
    { name: "JEE Main Full Syllabus Test", examType: "JEE_MAIN" as const, subject: "All Subjects", duration: 180, totalQuestions: 75, difficulty: "HARD" as const, description: "Full syllabus JEE Main — 25 Physics + 25 Chemistry + 25 Mathematics" },
    { name: "JEE Advanced Physics Mock Test", examType: "JEE_ADVANCED" as const, subject: "Physics", duration: 120, totalQuestions: 30, difficulty: "HARD" as const, description: "JEE Advanced Physics with advanced numerical and reasoning problems" },
    { name: "JEE Advanced Chemistry Mock Test", examType: "JEE_ADVANCED" as const, subject: "Chemistry", duration: 120, totalQuestions: 30, difficulty: "HARD" as const, description: "JEE Advanced Chemistry with advanced conceptual questions" },
    { name: "JEE Advanced Mathematics Mock Test", examType: "JEE_ADVANCED" as const, subject: "Mathematics", duration: 120, totalQuestions: 30, difficulty: "HARD" as const, description: "JEE Advanced Mathematics with advanced problem solving" },
    { name: "MHT-CET Physics Mock Test", examType: "MHT_CET" as const, subject: "Physics", duration: 90, totalQuestions: 50, difficulty: "MEDIUM" as const, description: "MHT-CET Physics practice test covering all chapters" },
    { name: "MHT-CET Chemistry Mock Test", examType: "MHT_CET" as const, subject: "Chemistry", duration: 90, totalQuestions: 50, difficulty: "MEDIUM" as const, description: "MHT-CET Chemistry practice test covering all chapters" },
    { name: "MHT-CET Mathematics Mock Test", examType: "MHT_CET" as const, subject: "Mathematics", duration: 90, totalQuestions: 50, difficulty: "MEDIUM" as const, description: "MHT-CET Mathematics practice test covering all chapters" },
  ]

  const difficulties = ["EASY", "MEDIUM", "HARD"] as const
  let totalQuestions = 0

  for (const testDef of testDefs) {
    const test = await prisma.mockTest.create({
      data: {
        name: testDef.name,
        examType: testDef.examType,
        subject: testDef.subject,
        duration: testDef.duration,
        totalQuestions: 0,
        difficulty: testDef.difficulty,
        description: testDef.description,
        isPublished: true,
        marksPerQuestion: 4,
        negativeMarking: testDef.examType === "JEE_ADVANCED" ? 2 : 1,
      },
    })

    const createdQuestions: string[] = []

    const subjectsToGenerate = testDef.subject === "All Subjects"
      ? ["Physics", "Chemistry", "Mathematics"]
      : [testDef.subject]

    const questionsPerSubject = Math.floor(testDef.totalQuestions / subjectsToGenerate.length)
    let qIndex = 0

    for (const subj of subjectsToGenerate) {
      const subjectChapters = chapters[subj as keyof typeof chapters] || []
      const questionsForSubject = testDef.subject === "All Subjects" ? questionsPerSubject : testDef.totalQuestions
      const targetPerChapter = Math.ceil(questionsForSubject / Math.max(subjectChapters.length, 1))
      let subjectQCount = 0

      for (const chapter of subjectChapters) {
        let chapterQCount = 0
        for (const topic of chapter.topics) {
          if (subjectQCount >= questionsForSubject) break
          const bank = getQuestions(subj, topic)
          if (bank.length === 0) continue

          const perTopic = Math.max(1, Math.ceil((questionsForSubject - subjectQCount) / (chapter.topics.length - chapter.topics.indexOf(topic))))
          let topicDone = 0

          while (topicDone < perTopic && subjectQCount < questionsForSubject) {
            const q = bank[(qIndex + topicDone) % bank.length]
            const diffIdx = qIndex % 3

            const question = await prisma.question.create({
              data: {
                mockTestId: test.id,
                questionText: q.text,
                options: q.options,
                correctOption: q.correct,
                explanation: q.explanation,
                subject: subj,
                chapter: chapter.name,
                topic: topic,
                difficulty: difficulties[diffIdx],
                examType: testDef.examType,
                order: qIndex,
                embedding: "",
              },
            })
            createdQuestions.push(question.id)
            qIndex++
            subjectQCount++
            topicDone++
            totalQuestions++
          }
        }
        chapterQCount++
      }
    }

    await prisma.mockTest.update({
      where: { id: test.id },
      data: { totalQuestions: createdQuestions.length },
    })

    console.log(`  ${test.name}: ${createdQuestions.length} questions`)
  }

  console.log(`\nTotal questions seeded: ${totalQuestions}`)
  console.log("Seeding completed successfully!")
}

main()
  .catch((e) => {
    console.error("Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
