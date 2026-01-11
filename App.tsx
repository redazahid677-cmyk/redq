
import React, { useState, useCallback, useEffect } from 'react';
import { NumberInput } from './components/NumberInput';
import { ResultCard } from './components/ResultCard';
import { findMultiLCM, findMultiGCD, getPrimeFactors, getComparisonStats } from './utils/math';
import { explainMathConcept, solveCustomProblem, solveEquation, solveSystemOfEquations } from './services/gemini';

// Icons
const CalculatorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
);

const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54Z"/></svg>
);

const CompareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/></svg>
);

const EquationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19h6"/><path d="M4 15h6"/><path d="M14 17h6"/><path d="M14 13h6"/><path d="M7 5l6 6"/><path d="M13 5l-6 6"/></svg>
);

const SystemIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="8" x="3" y="3" rx="1"/><rect width="8" height="8" x="13" y="3" rx="1"/><rect width="8" height="8" x="3" y="13" rx="1"/><rect width="8" height="8" x="13" y="13" rx="1"/></svg>
);

type ToolType = 'lcm_gcd' | 'compare' | 'equations' | 'systems' | 'ai_solver';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('lcm_gcd');
  const [inputNumbers, setInputNumbers] = useState('12, 18, 24');
  const [results, setResults] = useState<{ 
    lcm: number; 
    gcd: number; 
    factors: string;
    comparison: ReturnType<typeof getComparisonStats>
  } | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Equation Solver state
  const [equationInput, setEquationInput] = useState('2x + 5 = 15');
  const [equationSolution, setEquationSolution] = useState('');
  const [isSolvingEquation, setIsSolvingEquation] = useState(false);

  // Systems Solver state
  const [systemInput, setSystemInput] = useState('x + y = 10\nx - y = 2');
  const [systemSolution, setSystemSolution] = useState('');
  const [isSolvingSystem, setIsSolvingSystem] = useState(false);

  // Custom solver state
  const [customProblem, setCustomProblem] = useState('');
  const [customSolution, setCustomSolution] = useState('');
  const [isSolving, setIsSolving] = useState(false);

  const calculateResults = useCallback(() => {
    const nums = inputNumbers
      .split(/[,\s]+/)
      .map(n => parseFloat(n.trim()))
      .filter(n => !isNaN(n));

    if (nums.length < 1) {
      setResults(null);
      return;
    }

    const currentLcm = nums.length >= 2 ? findMultiLCM(nums) : 0;
    const currentGcd = nums.length >= 2 ? findMultiGCD(nums) : 0;
    const comparison = getComparisonStats(nums);
    
    // Format factors for display (only for integers)
    const factorOutputs = nums.map(n => {
      if (!Number.isInteger(n)) return `${n}: (لا يمكن تحليل الكسور للعوامل الأولية)`;
      const factors = getPrimeFactors(n);
      if (factors.length === 0) return `${n} = ${n}`;
      const factorStr = factors.map(f => `${f.factor}${f.count > 1 ? `^${f.count}` : ''}`).join(' × ');
      return `${n} = ${factorStr}`;
    }).join('\n');

    setResults({
      lcm: currentLcm,
      gcd: currentGcd,
      factors: factorOutputs,
      comparison
    });
  }, [inputNumbers]);

  const fetchAIExplanation = async (concept: string) => {
    const nums = inputNumbers
      .split(/[,\s]+/)
      .map(n => parseFloat(n.trim()))
      .filter(n => !isNaN(n));
    
    if (nums.length < 2) return;

    setIsAiLoading(true);
    const explanation = await explainMathConcept(concept, nums);
    setAiExplanation(explanation);
    setIsAiLoading(false);
  };

  const handleEquationSolve = async () => {
    if (!equationInput.trim()) return;
    setIsSolvingEquation(true);
    const solution = await solveEquation(equationInput);
    setEquationSolution(solution);
    setIsSolvingEquation(false);
  };

  const handleSystemSolve = async () => {
    if (!systemInput.trim()) return;
    setIsSolvingSystem(true);
    const solution = await solveSystemOfEquations(systemInput);
    setSystemSolution(solution);
    setIsSolvingSystem(false);
  };

  const handleCustomSolve = async () => {
    if (!customProblem.trim()) return;
    setIsSolving(true);
    const solution = await solveCustomProblem(customProblem);
    setCustomSolution(solution);
    setIsSolving(false);
  };

  useEffect(() => {
    calculateResults();
    setAiExplanation('');
  }, [inputNumbers, activeTool, calculateResults]);

  return (
    <div className="min-h-screen math-grid pb-20">
      {/* Header */}
      <header className="bg-indigo-700 text-white py-12 px-4 shadow-lg mb-8 relative overflow-hidden text-right">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 rotate-12 text-6xl font-serif">Σ</div>
          <div className="absolute bottom-10 right-20 -rotate-12 text-6xl font-serif">√</div>
          <div className="absolute top-1/2 left-1/4 text-4xl font-serif">π</div>
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2">الرياضي الذكي</h1>
          <p className="text-indigo-100 text-lg md:text-xl font-medium max-w-2xl">
            منصة متقدمة لحل المسائل الرياضية وفهمها بذكاء وسهولة
          </p>
        </div>
      </header>

      {/* Main Navigation */}
      <nav className="max-w-6xl mx-auto px-4 mb-8">
        <div className="flex flex-wrap gap-2 justify-center bg-white p-2 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <button
            onClick={() => setActiveTool('lcm_gcd')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-bold whitespace-nowrap ${
              activeTool === 'lcm_gcd' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-indigo-50'
            }`}
          >
            <CalculatorIcon />
            <span>المضاعف والقاسم</span>
          </button>
          <button
            onClick={() => setActiveTool('compare')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-bold whitespace-nowrap ${
              activeTool === 'compare' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-indigo-50'
            }`}
          >
            <CompareIcon />
            <span>مقارنة الأعداد</span>
          </button>
          <button
            onClick={() => setActiveTool('equations')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-bold whitespace-nowrap ${
              activeTool === 'equations' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-indigo-50'
            }`}
          >
            <EquationIcon />
            <span>حل المعادلات</span>
          </button>
          <button
            onClick={() => setActiveTool('systems')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-bold whitespace-nowrap ${
              activeTool === 'systems' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-indigo-50'
            }`}
          >
            <SystemIcon />
            <span>حل النظمات</span>
          </button>
          <button
            onClick={() => setActiveTool('ai_solver')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-bold whitespace-nowrap ${
              activeTool === 'ai_solver' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-indigo-50'
            }`}
          >
            <BrainIcon />
            <span>حل المسائل (AI)</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4">
        {(activeTool === 'lcm_gcd' || activeTool === 'compare') && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-indigo-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                <NumberInput
                  numbers={inputNumbers}
                  setNumbers={setInputNumbers}
                  label="أدخل الأرقام المراد معالجتها"
                  placeholder="مثال: 12.5, -18, 24"
                />
                <button
                  onClick={() => fetchAIExplanation(activeTool === 'compare' ? "مقارنة وترتيب الأعداد (تصاعدياً وتنازلياً)" : "المضاعف المشترك الأصغر والقاسم المشترك الأكبر")}
                  disabled={isAiLoading || inputNumbers.split(',').length < 2}
                  className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors duration-200 disabled:opacity-50"
                >
                  <BrainIcon />
                  {isAiLoading ? 'جاري التحليل...' : 'اشرح لي الطريقة بالذكاء الاصطناعي'}
                </button>
              </div>
            </div>

            {activeTool === 'lcm_gcd' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ResultCard
                    title="المضاعف المشترك الأصغر (LCM)"
                    result={results?.lcm ?? '...'}
                    explanation={aiExplanation}
                    isLoading={isAiLoading}
                  />
                  <ResultCard
                    title="القاسم المشترك الأكبر (GCD)"
                    result={results?.gcd ?? '...'}
                  />
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-indigo-50">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">تحليل الأعداد لعواملها الأولية</h3>
                  <div className="bg-gray-50 rounded-xl p-6 font-mono text-gray-700 whitespace-pre-line leading-relaxed text-center text-xl overflow-x-auto">
                    {results?.factors || "أدخل رقمين على الأقل للبدء"}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ResultCard
                    title="العدد الأكبر (القيمة العظمى)"
                    result={results?.comparison?.max ?? '...'}
                    explanation={aiExplanation}
                    isLoading={isAiLoading}
                  />
                  <ResultCard
                    title="العدد الأصغر (القيمة الصغرى)"
                    result={results?.comparison?.min ?? '...'}
                  />
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-indigo-50 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="text-indigo-600">↑</span> الترتيب التصاعدي:
                    </h3>
                    <div className="bg-green-50 rounded-xl p-4 text-center font-mono text-xl text-green-800">
                      {results?.comparison?.sortedAsc.join(' ← ') || '...'}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="text-red-600">↓</span> الترتيب التنازلي:
                    </h3>
                    <div className="bg-red-50 rounded-xl p-4 text-center font-mono text-xl text-red-800">
                      {results?.comparison?.sortedDesc.join(' ← ') || '...'}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTool === 'equations' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-indigo-50">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <EquationIcon />
                حل المعادلات الجبرية
              </h2>
              <p className="text-gray-600 mb-6 italic text-sm">أدخل المعادلة الرياضية وسنقوم بحلها مع عرض خطوات التبسيط والحل.</p>
              <div className="relative">
                <input
                  type="text"
                  value={equationInput}
                  onChange={(e) => setEquationInput(e.target.value)}
                  placeholder="مثال: x^2 - 4 = 0 أو 3x + 10 = 25"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-indigo-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-200 text-2xl font-mono mb-4 text-center dir-ltr"
                  dir="ltr"
                />
              </div>
              <button
                onClick={handleEquationSolve}
                disabled={isSolvingEquation || !equationInput.trim()}
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700 py-4 px-8 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSolvingEquation ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري حل المعادلة...
                  </>
                ) : (
                  <>
                    <CalculatorIcon />
                    حل المعادلة الآن
                  </>
                )}
              </button>
            </div>

            {equationSolution && (
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-indigo-50 border-t-4 border-t-indigo-500">
                <h3 className="text-xl font-bold text-indigo-700 mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  طريقة الحل والنتيجة:
                </h3>
                <div className="prose prose-indigo max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap text-right text-lg">
                  {equationSolution}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTool === 'systems' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-indigo-50">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <SystemIcon />
                حل نظم المعادلات
              </h2>
              <p className="text-gray-600 mb-6 italic text-sm">أدخل المعادلات (واحدة في كل سطر) وسنقوم بحل النظمة.</p>
              <textarea
                value={systemInput}
                onChange={(e) => setSystemInput(e.target.value)}
                placeholder={"x + y = 10\nx - y = 2"}
                className="w-full h-32 px-6 py-4 rounded-2xl border-2 border-indigo-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-200 text-xl font-mono mb-4 text-center dir-ltr resize-none"
                dir="ltr"
              />
              <button
                onClick={handleSystemSolve}
                disabled={isSolvingSystem || !systemInput.trim()}
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700 py-4 px-8 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSolvingSystem ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري حل النظمة...
                  </>
                ) : (
                  <>
                    <CalculatorIcon />
                    حل النظمة الآن
                  </>
                )}
              </button>
            </div>

            {systemSolution && (
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-indigo-50 border-t-4 border-t-indigo-500">
                <h3 className="text-xl font-bold text-indigo-700 mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  حل النظمة والخطوات:
                </h3>
                <div className="prose prose-indigo max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap text-right text-lg">
                  {systemSolution}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTool === 'ai_solver' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-indigo-50">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BrainIcon />
                مساعد المسائل الرياضية الشامل
              </h2>
              <p className="text-gray-600 mb-6 italic text-sm">أدخل نص المسألة الرياضية وسأقوم بحلها مع شرح الخطوات.</p>
              <textarea
                value={customProblem}
                onChange={(e) => setCustomProblem(e.target.value)}
                placeholder="اكتب مسألتك هنا... مثلاً: 'إذا كان عمر أحمد ضعف عمر خالد، ومجموع عمريهما 30 سنة، فكم عمر كل منهما؟'"
                className="w-full h-40 px-6 py-4 rounded-2xl border-2 border-indigo-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-200 text-lg resize-none mb-4"
              />
              <button
                onClick={handleCustomSolve}
                disabled={isSolving || !customProblem}
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700 py-4 px-8 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSolving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري التفكير والحل...
                  </>
                ) : (
                  <>
                    <CalculatorIcon />
                    حل المسألة الآن
                  </>
                )}
              </button>
            </div>

            {customSolution && (
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-indigo-50 border-t-4 border-t-indigo-500">
                <h3 className="text-xl font-bold text-gray-800 mb-4">الحل التفصيلي:</h3>
                <div className="prose prose-indigo max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap text-right">
                  {customSolution}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-20 py-8 border-t border-gray-200 text-center text-gray-500">
        <p>© {new Date().getFullYear()} الرياضي الذكي - مدعوم بتقنيات الذكاء الاصطناعي</p>
      </footer>
    </div>
  );
};

export default App;
