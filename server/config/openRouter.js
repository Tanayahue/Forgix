const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions"
const textModel = process.env.OPENROUTER_TEXT_MODEL || "deepseek/deepseek-chat"
const visionModel = process.env.OPENROUTER_VISION_MODEL || "openai/gpt-4o-mini"

const createOpenRouterRequest = async ({ model, messages, temperature = 0.2 }) => {
    if (!process.env.OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is not configured")
    }

    const res = await fetch(openRouterUrl, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model,
            messages,
            temperature
        })
    })

    if (!res.ok) {
        const err = await res.text()
        throw new Error("OpenRouter error: " + err)
    }

    const data = await res.json()
    return data?.choices?.[0]?.message?.content ?? ""
}

const generateResponse = async (prompt) => {
    return createOpenRouterRequest({
        model: textModel,
        messages: [
            { role: "system", content: "You must return only valid raw JSON." },
            {
                role: "user",
                content: prompt
            }
        ]
    })
}

const generateVisionResponse = async ({ prompt, imageUrl }) => {
    return createOpenRouterRequest({
        model: visionModel,
        messages: [
            { role: "system", content: "You must return only valid raw JSON." },
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: prompt
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: imageUrl
                        }
                    }
                ]
            }
        ]
    })
}

export { createOpenRouterRequest, generateResponse, generateVisionResponse }
export default generateResponse
