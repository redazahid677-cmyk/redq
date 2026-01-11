
import { GoogleGenAI } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const explainMathConcept = async (concept: string, numbers: number[]) => {
  const ai = getAI();
  const prompt = `شرح مفهوم ${concept} للأعداد التالية: ${numbers.join(', ')}. 
  اشرح الخطوات بوضوح وباللغة العربية المبسطة.
  استخدم تنسيق Markdown.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "أنت معلم رياضيات خبير تشرح المفاهيم بوضوح وسهولة للطلاب باللغة العربية.",
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "عذراً، حدث خطأ أثناء محاولة جلب الشرح. يرجى المحاولة لاحقاً.";
  }
};

export const solveCustomProblem = async (problemText: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `حل المسألة الرياضية التالية مع شرح الخطوات بالتفصيل باللغة العربية: ${problemText}`,
      config: {
        systemInstruction: "أنت خبير في حل المسائل الرياضية المعقدة. قدم الحل بشكل منظم مع شرح كل خطوة.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "عذراً، لم أستطع حل هذه المسألة. تأكد من صياغتها بشكل واضح.";
  }
};

export const solveEquation = async (equation: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `قم بحل المعادلة التالية: ${equation}. 
      المطلوب:
      1. كتابة النتيجة النهائية بوضوح في البداية.
      2. شرح خطوات الحل خطوة بخطوة بالتفصيل.
      3. استخدم اللغة العربية في الشرح.`,
      config: {
        systemInstruction: "أنت خبير جبر ورياضيات. حل المعادلات بوضوح مع تبسيط كل خطوة للطالب.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "عذراً، لم أستطع حل هذه المعادلة. تأكد من صحة كتابتها.";
  }
};

export const solveSystemOfEquations = async (system: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `قم بحل نظمة المعادلات التالية:
      ${system}
      المطلوب:
      1. إيجاد قيم المجاهيل (مثل x, y, z).
      2. شرح طريقة الحل (سواء بالتعويض أو الحذف أو المصفوفات).
      3. شرح الخطوات بالتفصيل وباللغة العربية.`,
      config: {
        systemInstruction: "أنت خبير في الجبر الخطي وحل نظم المعادلات. قدم الحل بطريقة تعليمية منظمة وسهلة الفهم.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "عذراً، لم أتمكن من حل هذه النظمة. يرجى التأكد من كتابة المعادلات بشكل صحيح (معادلة في كل سطر).";
  }
};
