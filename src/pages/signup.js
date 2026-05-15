import { useRef, useState } from "react";
import PageHeader from "../Components/pageHeader";
import { Container, Form } from "react-bootstrap";

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

// Web3Forms access keys are public (lock down with domain allowlist at web3forms.com).
// Build can set REACT_APP_WEB3FORMS_ACCESS_KEY; fallback keeps the form working if CI/CD env is missed.
const WEB3FORMS_ACCESS_KEY_FALLBACK = "06b20b07-69cd-4f56-b90e-43f5f72c639e";

const FIELD_LABELS = {
    businessName: "Business name",
    businessOwner: "Business owner",
    businessAddress: "Business address",
    apt: "Apt / suite",
    city: "City",
    state: "State / Province",
    zip: "ZIP / Postal code",
    phone: "Business phone",
    email: "Business email",
    website: "Business website",
    "contact-name": "Primary contact",
    title: "Job title",
    "contact-email": "Primary contact email",
    trades: "Selected trades",
};

function flattenFormFields(formEl) {
    const merged = {};
    const data = new FormData(formEl);
    for (const [key, value] of data.entries()) {
        const str = typeof value === "string" ? value : String(value);
        if (merged[key] !== undefined) {
            merged[key] = `${merged[key]}, ${str}`;
        } else {
            merged[key] = str;
        }
    }
    delete merged.trade;
    return merged;
}

function labeledPayload(raw) {
    const out = {};
    for (const [key, value] of Object.entries(raw)) {
        const label = FIELD_LABELS[key] ?? key;
        out[label] = value;
    }
    return out;
}

export default function Signup() {
    const form = useRef(null);
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const el = form.current;
        if (!el) return;

        if (!el.checkValidity()) {
            el.reportValidity();
            return;
        }

        const accessKey =
            (process.env.REACT_APP_WEB3FORMS_ACCESS_KEY || "").trim() ||
            WEB3FORMS_ACCESS_KEY_FALLBACK;

        const fd = new FormData(el);
        const selectedTrades = fd.getAll("trade").join(", ");
        const tradesField = el.querySelector("#contractor-signup-trades");
        if (tradesField) tradesField.value = selectedTrades || "(none selected)";

        const raw = flattenFormFields(el);
        const businessName = (raw.businessName || "").trim() || "Contractor signup";
        const contactEmail =
            String(raw["contact-email"] ?? "")
                .trim() || String(raw.email ?? "").trim();

        const labeled = labeledPayload(raw);

        setSending(true);
        try {
            const response = await fetch(WEB3FORMS_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    access_key: accessKey,
                    subject: `Contractor sign-up: ${businessName}`,
                    ...(contactEmail ? { replyto: contactEmail } : {}),
                    from_name: `Website — ${businessName}`,
                    ...labeled,
                }),
            });

            const result = await response.json().catch(() => ({}));
            if (response.ok && result.success === true) {
                alert("Form submitted successfully!");
                el.reset();
            } else {
                const detail =
                    result.message ||
                    result.error ||
                    (typeof result === "object" ? JSON.stringify(result) : "Unknown error");
                throw new Error(detail || `HTTP ${response.status}`);
            }
        } catch (error) {
            console.error("Form submit FAILED", error);
            alert(`Something went wrong: ${error?.message ?? error}`);
        } finally {
            setSending(false);
        }
    };

    return (
        <>
        <PageHeader title="Contractor Sign-Up"/>
        <Container id="contractor-form">
            <Form ref={form} onSubmit={handleSubmit} noValidate>
                <Form.Group className="mb-3" controlId="businessName">
                    <Form.Label>Business Name</Form.Label>
                    <Form.Control type="text" name = "businessName" placeholder="Enter name" required/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="businessOwner">
                    <Form.Label>Business Owner</Form.Label>
                    <Form.Control type="text" name="businessOwner" placeholder="Enter Owner"/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="businessAddress">
                    <Form.Label>Business Address</Form.Label>
                    <Form.Control type="text" name="businessAddress" placeholder="Enter Address"/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="apt">
                    <Form.Label>Apartment,suite,etc</Form.Label>
                    <Form.Control type="text" name="apt" placeholder="Enter Apt"/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="city">
                    <Form.Label>City</Form.Label>
                    <Form.Control type="text" name="city" placeholder="Enter City"/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="state">
                    <Form.Label>State/Province</Form.Label>
                    <Form.Control type="text" name="state" placeholder="Enter State/Province"/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="zip">
                    <Form.Label>ZIP / Postal Code</Form.Label>
                    <Form.Control type="text" name="zip" placeholder="Enter ZIP/Postal Code"/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="phone">
                    <Form.Label>Business Phone</Form.Label>
                    <Form.Control type="text" name="phone" placeholder="Enter Phone #"/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Business Email</Form.Label>
                    <Form.Control type="text" name="email" placeholder="Enter Email"/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="website">
                    <Form.Label>Business Website</Form.Label>
                    <Form.Control type="text"name="website" placeholder="Enter Website"/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="contact-name">
                    <Form.Label>Primary Contact</Form.Label>
                    <Form.Control type="text" name="contact-name" placeholder="Enter Contact"/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="title">
                    <Form.Label>Job Title</Form.Label>
                    <Form.Control type="text" name="title" placeholder="Enter Title" required/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="contact-email">
                    <Form.Label>Primary Contact Email</Form.Label>
                    <Form.Control type="text" name="contact-email" placeholder="Enter Primary Contact Email" required/>
                </Form.Group>
                <Form.Label>Select Trades</Form.Label>
                <Form.Group className="mb-3" controlId="trades">
                    <Form.Check // prettier-ignore
                    type="checkbox"
                    value="appliance"
                    name="trade"
                    label="Appliance Install / Repair"
                    />
                    <Form.Check
                    type="checkbox"
                    value="cabinets"
                    name="trade"
                    label="Cabinets"
                    />
                    <Form.Check
                    type="checkbox"
                    value="carpenter"
                    name="trade"
                    label="Carpenter"
                    />
                    <Form.Check
                    type="checkbox"
                    value="cleaning"
                    name="trade"
                    label="Cleaning - Interior"
                    />
                    <Form.Check
                    type="checkbox"
                    value="chimney"
                    name="trade"
                    label="Chimney Maintenance / Repair"
                    />
                    <Form.Check
                    type="checkbox"
                    value="concrete"
                    name="trade"
                    label="Concrete"
                    />
                    <Form.Check
                    type="checkbox"
                    value="countertops"
                    name="trade"
                    label="Countertops"
                    />
                    <Form.Check
                    type="checkbox"
                    value="doors"
                    name="trade"
                    label="Doors"
                    />
                    <Form.Check
                    type="checkbox"
                    value="drywall"
                    name="trade"
                    label="Dry Wall Install / Repair"
                    />
                    <Form.Check
                    type="checkbox"
                    value="electrician"
                    name="trade"
                    label="Electrician"
                    />
                    <Form.Check
                    type="checkbox"
                    value="engineering"
                    name="trade"
                    label="Engineering"
                />
                <Form.Check
                    type="checkbox"
                    value="environmental"
                    name="trade"
                    label="Environmental / Asbestos / Abatement"
                />
                <Form.Check
                    type="checkbox"
                    value="estimator"
                    name="trade"
                    label="Estimator"
                />
                <Form.Check
                    type="checkbox"
                    value="flooring"
                    name="trade"
                    label="Flooring"
                />
                <Form.Check
                    type="checkbox"
                    value="foundation"
                    name="trade"
                    label="Foundation Repair"
                />
                <Form.Check
                    type="checkbox"
                    value="framing"
                    name="trade"
                    label="Framing"
                />
                <Form.Check
                    type="checkbox"
                    value="garage-doors"
                    name="trade"
                    label="Garage Doors"
                />
                <Form.Check
                    type="checkbox"
                    value="general-contractor"
                    name="trade"
                    label="General Contractor"
                />
                <Form.Check
                    type="checkbox"
                    value="general-labor"
                    name="trade"
                    label="General Labor"
                />
                <Form.Check
                    type="checkbox"
                    value="gutters"
                    name="trade"
                    label="Gutter Installation / Repair"
                />
                <Form.Check
                    type="checkbox"
                    value="hvac"
                    name="trade"
                    label="HVAC"
                />
                <Form.Check
                    type="checkbox"
                    value="handyman"
                    name="trade"
                    label="Handyman"
                />
                <Form.Check
                    type="checkbox"
                    value="land-survey"
                    name="trade"
                    label="Land Survey"
                />
                <Form.Check
                    type="checkbox"
                    value="landscaping"
                    name="trade"
                    label="Landscaping"
                />
                <Form.Check
                    type="checkbox"
                    value="maintenance"
                    name="trade"
                    label="Maintenance"
                />
                <Form.Check
                    type="checkbox"
                    value="painter"
                    name="trade"
                    label="Painter"
                />
                <Form.Check
                    type="checkbox"
                    value="pest-control"
                    name="trade"
                    label="Pest Control"
                />
                <Form.Check
                    type="checkbox"
                    value="plumber"
                    name="trade"
                    label="Plumber"
                />
                <Form.Check
                    type="checkbox"
                    value="pool"
                    name="trade"
                    label="Pool Maintenance"
                />
                <Form.Check
                    type="checkbox"
                    value="pressure-washing"
                    name="trade"
                    label="Pressure Washing"
                />
                <Form.Check
                    type="checkbox"
                    value="remediation"
                    name="trade"
                    label="Remediation"
                />
                <Form.Check
                    type="checkbox"
                    value="roofer"
                    name="trade"
                    label="Roofer"
                />
                <Form.Check
                    type="checkbox"
                    value="septic"
                    name="trade"
                    label="Septic"
                />
                <Form.Check
                    type="checkbox"
                    value="supplier"
                    name="trade"
                    label="Supplier"
                />
                <Form.Check
                    type="checkbox"
                    value="tile"
                    name="trade"
                    label="Tile Installer"
                />
                <Form.Check
                    type="checkbox"
                    value="water-proofing"
                    name="trade"
                    label="Water Proofing"
                />
                <Form.Check
                    type="checkbox"
                    value="well-treatment"
                    name="trade"
                    label="Well Treatment"
                />
                <Form.Check
                    type="checkbox"
                    value="windows"
                    name="trade"
                    label="Windows"
                />
                <input type="hidden" name="trades" id="contractor-signup-trades" />
                </Form.Group>
                <button type="submit" disabled={sending}>{sending ? "Sending…" : "Submit"}</button>
            </Form>
        </Container>
        </>
    )
}
