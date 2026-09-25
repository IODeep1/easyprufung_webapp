import {FormLogoValues} from "../../components/User/Projects/ProjectLogo/context/logo-context.tsx";

const styleLookup: { [key: string]: string } = {
    flashy: "Flashy, attention grabbing, bold, futuristic, and eye-catching. Use vibrant neon colors with metallic, shiny, and glossy accents.",
    tech: "highly detailed, sharp focus, cinematic, photorealistic, Minimalist, clean, sleek, neutral color pallete with subtle accents, clean lines, shadows, and flat.",
    corporate: "modern, forward-thinking, flat design, geometric shapes, clean lines, natural colors with subtle accents, use strategic negative space to create visual interest.",
    creative: "playful, lighthearted, bright bold colors, rounded shapes, lively.",
    abstract: "abstract, artistic, creative, unique shapes, patterns, and textures to create a visually interesting and wild logo.",
    minimal: "minimal, simple, timeless, versatile, single color logo, use negative space, flat design with minimal details, Light, soft, and subtle.",
};

const generatePrompt = (values: FormLogoValues): string => {
    const prompt = `A single logo, high-quality, award-winning professional design, made for both digital and print media, only contains a few vector shapes, ${styleLookup[values.style]}. Primary color is ${values.primaryColor} and background color is ${values.backgroundColor}. The company name is ${values.name}. Additional info: ${values.description}`;
    return prompt;
}

const convertToBaset64Image = (base64ImageData: string) => {
    return `data:image/png;base64,${base64ImageData}`
}

const generateLogoWithTogether = async (prompt: string) => {

    const response = await fetch("/api/project/logo/generate", {
        method: "POST",
        headers: {
            Authorization: 'Bearer '+localStorage.getItem('access-token'),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
        throw new Error("Failed Generate Logo");
    }

    const result = await response.json();
    return result.b64_json;
}

export const generateLogoRequest = async (values: FormLogoValues): Promise<string> => {
    const prompt = generatePrompt(values);
    try {
        return await generateLogoWithTogether(prompt);
    } catch (err) {
        console.error("Togerther Failed:", err);
        return  "";
    }
}