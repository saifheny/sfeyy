const fetch = require('node-fetch');

// 🔴 هذا المتغير ينتظر المفتاح السري من Vercel
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY; 
const DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';

module.exports = async (req, res) => {
    // إعدادات CORS
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).send();
    }
    
    // الأمان: التحقق من المفتاح الجديد
    if (!DEEPSEEK_API_KEY) {
        return res.status(500).json({ error: 'مفتاح DeepSeek السري غير موجود. الرجاء إعداده في Vercel.' });
    }

    try {
        const userPrompt = req.body.idea;

        const requestBody = {
            model: "deepseek-chat", // النموذج الأفضل للدردشة والقصص
            messages: [
                {
                    role: "system",
                    content: "أنت كاتب قصص مبدع. مهمتك هي كتابة قصة قصيرة ومثيرة (في 3 أو 4 أسطر) بناءً على طلب المستخدم."
                },
                {
                    role: "user",
                    content: userPrompt
                }
            ],
            stream: false
        };

        const apiResponse = await fetch(DEEPSEEK_ENDPOINT, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                // إرسال مفتاح DeepSeek
                'Authorization': Bearer ${DEEPSEEK_API_KEY} 
            },
            body: JSON.stringify(requestBody)
        });

        const data = await apiResponse.json();

        if (data.choices && data.choices[0]) {
            const storyText = data.choices[0].message.content;
            res.status(200).json({ storyText: storyText });
        } else {
            res.status(500).json({ error: data.error ? data.error.message : 'فشل في توليد القصة من DeepSeek.' });
        }

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: 'فشل في الاتصال بالخادم.' });
    }
};
