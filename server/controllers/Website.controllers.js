import generateResponse, { generateVisionResponse } from "../config/openRouter.js";
import User from "../models/user.model.js";
import Website from "../models/website.model.js";
import extractJson from "../utils/extractJson.js";

const masterPrompt = `
YOU ARE A PRINCIPAL FRONTEND ARCHITECT
AND A SENIOR UI/UX ENGINEER
SPECIALIZED IN RESPONSIVE DESIGN SYSTEMS.

YOU BUILD HIGH-END, REAL-WORLD, PRODUCTION-GRADE WEBSITES
USING ONLY HTML, CSS, AND JAVASCRIPT
THAT WORK PERFECTLY ON ALL SCREEN SIZES.

THE OUTPUT MUST BE CLIENT-DELIVERABLE WITHOUT ANY MODIFICATION.

❌ NO FRAMEWORKS
❌ NO LIBRARIES
❌ NO BASIC SITES
❌ NO PLACEHOLDERS
❌ NO NON-RESPONSIVE LAYOUTS

--------------------------------------------------
USER REQUIREMENT:
{USER_PROMPT}
--------------------------------------------------

GLOBAL QUALITY BAR (NON-NEGOTIABLE)
--------------------------------------------------
- Premium, modern UI (2026–2027)
- Professional typography & spacing
- Clean visual hierarchy
- Business-ready content (NO lorem ipsum)
- Smooth transitions & hover effects
- SPA-style multi-page experience
- Production-ready, readable code

--------------------------------------------------
RESPONSIVE DESIGN (ABSOLUTE REQUIREMENT)
--------------------------------------------------
THIS WEBSITE MUST BE FULLY RESPONSIVE.

YOU MUST IMPLEMENT:

✔ Mobile-first CSS approach
✔ Responsive layout for:
  - Mobile (<768px)
  - Tablet (768px–1024px)
  - Desktop (>1024px)

✔ Use:
  - CSS Grid / Flexbox
  - Relative units (%, rem, vw)
  - Media queries

✔ REQUIRED RESPONSIVE BEHAVIOR:
  - Navbar collapses / stacks on mobile
  - Sections stack vertically on mobile
  - Multi-column layouts become single-column on small screens
  - Images scale proportionally
  - Text remains readable on all devices
  - No horizontal scrolling on mobile
  - Touch-friendly buttons on mobile

IF THE WEBSITE IS NOT RESPONSIVE → RESPONSE IS INVALID.

--------------------------------------------------
IMAGES (MANDATORY & RESPONSIVE)
--------------------------------------------------
- Use high-quality images ONLY from:
  https://images.unsplash.com/
- EVERY image URL MUST include:
  ?auto=format&fit=crop&w=1200&q=80

- Images must:
  - Be responsive (max-width: 100%)
  - Resize correctly on mobile
  - Never overflow containers

--------------------------------------------------
TECHNICAL RULES (VERY IMPORTANT)
--------------------------------------------------
- Output ONE single HTML file
- Exactly ONE <style> tag
- Exactly ONE <script> tag
- NO external CSS / JS / fonts
- Use system fonts only
- iframe srcdoc compatible
- SPA-style navigation using JavaScript
- No page reloads
- No dead UI
- No broken buttons
--------------------------------------------------
SPA VISIBILITY RULE (MANDATORY)
--------------------------------------------------
- Pages MUST NOT be hidden permanently
- If .page { display: none } is used,
  then .page.active { display: block } is REQUIRED
- At least ONE page MUST be visible on initial load
- Hiding all content is INVALID


--------------------------------------------------
REQUIRED SPA PAGES
--------------------------------------------------
- Home
- About
- Services / Features
- Contact

--------------------------------------------------
FUNCTIONAL REQUIREMENTS
--------------------------------------------------
- Navigation must switch pages using JS
- Active nav state must update
- Forms must have JS validation
- Buttons must show hover + active states
- Smooth section/page transitions

--------------------------------------------------
FINAL SELF-CHECK (MANDATORY)
--------------------------------------------------
BEFORE RESPONDING, ENSURE:

1. Layout works on mobile, tablet, desktop
2. No horizontal scroll on mobile
3. All images are responsive
4. All sections adapt properly
5. Media queries are present and used
6. Navigation works on all screen sizes
7. At least ONE page is visible without user interaction

IF ANY CHECK FAILS → RESPONSE IS INVALID

--------------------------------------------------
OUTPUT FORMAT (RAW JSON ONLY)
--------------------------------------------------
{
  "message": "Short professional confirmation sentence",
  "code": "<FULL VALID HTML DOCUMENT>"
}

--------------------------------------------------
ABSOLUTE RULES
--------------------------------------------------
- RETURN RAW JSON ONLY
- NO markdown
- NO explanations
- NO extra text
- FORMAT MUST MATCH EXACTLY
- IF FORMAT IS BROKEN → RESPONSE IS INVALID
`;

const visualRecreationPrompt = `
YOU ARE A SENIOR FRONTEND RECONSTRUCTION ENGINEER.

TASK:
Recreate the referenced website as faithfully as possible using only HTML, CSS, and JavaScript in a single file.

PRIMARY GOAL:
- Preserve the observed layout, spacing, sizing, hierarchy, typography feel, color palette, borders, shadows, and interaction patterns.
- Match the overall structure closely while producing clean, readable code.

INPUT RULES:
- If a screenshot is provided, treat the visual appearance as the source of truth.
- If a URL summary is provided, use the extracted structure/content as the source of truth.
- If the user adds extra instructions, apply them only if they do not conflict with the visual fidelity goal.

OUTPUT RULES:
- Return ONE full HTML document only inside JSON.
- Exactly ONE <style> tag.
- Exactly ONE <script> tag.
- No external CSS or JS libraries.
- System fonts only.
- Must be iframe srcdoc compatible.
- Must be responsive on mobile, tablet, and desktop.
- No markdown, no explanations, no extra text.

VISUAL FIDELITY CHECKLIST:
- Recreate page sections in the same order
- Preserve navigation structure
- Preserve main hero/content layout
- Preserve cards, grids, buttons, and spacing rhythm
- Use visually similar colors, gradients, radii, and shadows
- Avoid generic substitutions when the reference clearly suggests a stronger design choice

FINAL OUTPUT FORMAT:
{
  "message": "Short professional confirmation sentence",
  "code": "<FULL VALID HTML DOCUMENT>"
}
`;

const isValidHttpUrl = (value) => {
    try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
};

const stripHtml = (html = "") =>
    html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

const buildUrlSnapshot = async (sourceUrl) => {
    const response = await fetch(sourceUrl, {
        headers: {
            "User-Agent": "ForgixBot/1.0"
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch URL content: ${response.status}`);
    }

    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const descriptionMatch = html.match(
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i
    );

    return {
        title: titleMatch?.[1]?.trim() || "",
        description: descriptionMatch?.[1]?.trim() || "",
        textContent: stripHtml(html).slice(0, 14000),
    };
};

const parseModelJsonResponse = async (runner, prompt) => {
    let raw = "";
    let parsed = null;

    for (let i = 0; i < 2 && !parsed; i++) {
        raw = await runner(prompt);
        parsed = await extractJson(raw);

        if (!parsed) {
            raw = await runner(`${prompt}\n\nRETURN ONLY RAW JSON.`);
            parsed = await extractJson(raw);
        }
    }

    if (!parsed?.code) {
        console.log("ai returned invalid response", raw);
        throw new Error("ai returned invalid response");
    }

    return parsed;
};


export const generateWebsite = async (req, res) => {
    try {
        const {
            prompt = "",
            mode = "prompt",
            referenceImage,
            sourceUrl,
        } = req.body

        const trimmedPrompt = prompt.trim()

        if (mode === "prompt" && !trimmedPrompt) {
            return res.status(400).json({ message: "prompt is required" })
        }

        if (mode === "image" && !referenceImage) {
            return res.status(400).json({ message: "reference image is required" })
        }

        if (mode === "url" && !sourceUrl) {
            return res.status(400).json({ message: "source url is required" })
        }

        if (mode === "url" && !isValidHttpUrl(sourceUrl)) {
            return res.status(400).json({ message: "please provide a valid http or https url" })
        }
        const user = await User.findById(req.user._id)

        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }
        if (user.credits < 50) {
            return res.status(400).json({ message: "you have not enough credits to generate a webiste" })
        }

        let parsed = null
        let generationSummary = trimmedPrompt

        if (mode === "image") {
            const imagePrompt = `
${visualRecreationPrompt}

USER NOTES:
${trimmedPrompt || "Recreate the reference faithfully and use sensible real-world content where text is unreadable."}
`;

            parsed = await parseModelJsonResponse(
                (finalPrompt) =>
                    generateVisionResponse({
                        prompt: finalPrompt,
                        imageUrl: referenceImage,
                    }),
                imagePrompt
            );
            generationSummary = trimmedPrompt || "Recreated website from screenshot";
        } else if (mode === "url") {
            const snapshot = await buildUrlSnapshot(sourceUrl);
            const urlPrompt = `
${visualRecreationPrompt}

SOURCE URL:
${sourceUrl}

SOURCE TITLE:
${snapshot.title || "Unknown"}

SOURCE DESCRIPTION:
${snapshot.description || "None provided"}

EXTRACTED PAGE TEXT:
${snapshot.textContent}

USER NOTES:
${trimmedPrompt || "Recreate the current experience faithfully while keeping the output clean and responsive."}
`;

            parsed = await parseModelJsonResponse(generateResponse, urlPrompt);
            generationSummary = trimmedPrompt || `Recreated website from ${sourceUrl}`;
        } else {
            const finalPrompt = masterPrompt.replace("{USER_PROMPT}", trimmedPrompt)
            parsed = await parseModelJsonResponse(generateResponse, finalPrompt)
        }

        const website = await Website.create({
            user: user._id,
            title: generationSummary.slice(0, 60),
            latestCode: parsed.code,
            conversation: [
                {
                    role: "user",
                    content:
                        mode === "image"
                            ? `Recreate from screenshot. ${generationSummary}`.trim()
                            : mode === "url"
                                ? `Recreate from URL: ${sourceUrl}. ${trimmedPrompt}`.trim()
                                : trimmedPrompt
                },
                {
                    role: "ai",
                    content: parsed.message
                }
                
            ]
        })

        user.credits = user.credits - 50
        await user.save()

        return res.status(201).json({
            websiteId: website._id,
            remainingCredits: user.credits
        })

    } catch (error) {
        return res.status(500).json({ message: `generate website error ${error}` })
    }
}


export const getWebsiteById = async (req, res) => {
    try {
        const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        })

        if (!website) {
            return res.status(400).json({ message: "website not found" })
        }
        return res.status(200).json(website)
    } catch (error) {
        return res.status(500).json({ message: `get website by id error ${error}` })
    }
}


export const changes = async (req, res) => {
    try {
        const { prompt } = req.body
        if (!prompt) {
            return res.status(400).json({ message: "prompt is required" })
        }

        const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        })

        if (!website) {
            return res.status(400).json({ message: "website not found" })
        }

        const user = await User.findById(req.user._id)

        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }
        if (user.credits < 25) {
            return res.status(400).json({ message: "you have not enough credits to generate a webiste" })
        }

        const updatePrompt = `
UPDATE THIS HTML WEBSITE.

CURRENT CODE:
${website.latestCode}

USER REQUEST:
${prompt}

RETURN RAW JSON ONLY:
{
  "message": "Short confirmation",
  "code": "<UPDATED FULL HTML>"
}
`
        let raw = ""
        let parsed = null
        for (let i = 0; i < 2 && !parsed; i++) {
            raw = await generateResponse(updatePrompt)
            parsed = await extractJson(raw)

            if (!parsed) {
                raw = await generateResponse(updatePrompt + "\n\nRETURN ONLY RAW JSON.")
                parsed = await extractJson(raw)
            }

        }

        if (!parsed?.code) {
            console.log("ai returned invalid response", raw)
            return res.status(400).json({ message: "ai returned invalid response" })
        }


        website.conversation.push(
            { role: "user", content: prompt },
            { role: "ai", content: parsed.message },
        )

        website.latestCode = parsed.code

        await website.save()
        user.credits = user.credits - 25
        await user.save()

        return res.status(200).json({
            message:parsed.message,
            code:parsed.code,
            remainingCredits: user.credits
        })


    } catch (error) {
        console.log(error)
 return res.status(500).json({ message: `update website error ${error}` })
    }
}



export const getAll=async (req,res) => {
    try {
        const websites=await Website.find({user:req.user._id})
        return res.status(200).json(websites)
    } catch (error) {
        return res.status(500).json({ message: `get all websites error ${error}` })
    }
}


export const deploy=async (req,res)=>{
    try {
         const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        })

        if (!website) {
            return res.status(400).json({ message: "website not found" })
        }

        if(!website.slug){// deploy
            const baseSlug = website.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "")
                .slice(0, 50)

            website.slug = `${baseSlug || "website"}-${website._id.toString().slice(-5)}`
        }

        website.deployed=true
        const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173"
        website.deployUrl=`${frontendUrl}/site/${website.slug}`
        await website.save()

        return res.status(200).json({
            url:website.deployUrl
        })

    } catch (error) {
         return res.status(500).json({ message: `deploy website error ${error}` })
    }
}


export const getBySlug=async (req,res) => {
    try {
         const website = await Website.findOne({
            slug: req.params.slug,
            deployed: true
        })

        if (!website) {
            return res.status(404).json({ message: "website not found" })
        }
          return res.status(200).json(website)
    } catch (error) {
        return res.status(500).json({ message: `get by slug website error ${error}` })
    }
}
