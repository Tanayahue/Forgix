import generateResponse from "../config/openRouter.js";
import extractJson from "../utils/extractJson.js";

export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.json({ user: null });
    }

    return res.json({
      user: req.user,
    });

  } catch (error) {
    return res.status(500).json({
      message: `get current user error ${error}`,
    });
  }
};

export const generatedemo = async (req, res) => {
  try {
    const content = await generateResponse("hello");
    const data = await extractJson(content);

    if (!data) {
      return res.status(502).json({
        message: "Model returned an invalid JSON response",
        raw: content,
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to generate demo response",
    });
  }
};
