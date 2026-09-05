/**
 * LaTeX and Mathematical Expression Phonetizer for Speech Synthesis
 * Converts LaTeX formulas, mathematical notation, and formatted scientific text
 * into natural, fluent spoken English for P.A.S.C.A.L.'s voice engine.
 */

// Greek letter pronunciation mapping
const GREEK_LETTERS: Record<string, string> = {
  alpha: 'alpha',
  beta: 'beta',
  gamma: 'gamma',
  delta: 'delta',
  epsilon: 'epsilon',
  varepsilon: 'epsilon',
  zeta: 'zeta',
  eta: 'eta',
  theta: 'theta',
  vartheta: 'theta',
  iota: 'iota',
  kappa: 'kappa',
  lambda: 'lambda',
  mu: 'mu',
  nu: 'nu',
  xi: 'ksee',
  pi: 'pi',
  varpi: 'pi',
  rho: 'rho',
  varrho: 'rho',
  sigma: 'sigma',
  varsigma: 'sigma',
  tau: 'tau',
  upsilon: 'upsilon',
  phi: 'phi',
  varphi: 'phi',
  chi: 'chi',
  psi: 'psi',
  omega: 'omega',
  Gamma: 'capital Gamma',
  Delta: 'Delta',
  Theta: 'capital Theta',
  Lambda: 'capital Lambda',
  Xi: 'capital Xi',
  Pi: 'capital Pi',
  Sigma: 'capital Sigma',
  Upsilon: 'capital Upsilon',
  Phi: 'capital Phi',
  Psi: 'capital Psi',
  Omega: 'capital Omega',
};

// Common mathematical symbols and operators
const MATH_OPERATORS: Array<[RegExp, string]> = [
  [/\\pm\b|±/g, ' plus or minus '],
  [/\\mp\b/g, ' minus or plus '],
  [/\\times\b|×/g, ' times '],
  [/\\cdot\b|⋅/g, ' times '],
  [/\\div\b|÷/g, ' divided by '],
  [/\\neq\b|\\ne\b|≠/g, ' is not equal to '],
  [/\\approx\b|≈/g, ' is approximately '],
  [/\\sim\b|∼/g, ' is similar to '],
  [/\\propto\b|∝/g, ' is proportional to '],
  [/\\equiv\b|≡/g, ' is equivalent to '],
  [/\\leq\b|\\le\b|≤/g, ' is less than or equal to '],
  [/\\geq\b|\\ge\b|≥/g, ' is greater than or equal to '],
  [/\\ll\b|≪/g, ' is much less than '],
  [/\\gg\b|≫/g, ' is much greater than '],
  [/\\infty\b|∞/g, ' infinity '],
  [/\\nabla\b|∇/g, ' del '],
  [/\\partial\b|∂/g, ' partial '],
  [/\\forall\b|∀/g, ' for all '],
  [/\\exists\b|∃/g, ' there exists '],
  [/\\nexists\b|∄/g, ' there does not exist '],
  [/\\in\b|∈/g, ' in '],
  [/\\notin\b|∉/g, ' not in '],
  [/\\subset\b|⊂/g, ' subset of '],
  [/\\subseteq\b|⊆/g, ' subset of or equal to '],
  [/\\cup\b|∪/g, ' union '],
  [/\\cap\b|∩/g, ' intersection '],
  [/\\to\b|\\rightarrow\b|\\longrightarrow\b|→/g, ' approaches '],
  [/\\leftarrow\b|\\longleftarrow\b|←/g, ' left arrow '],
  [/\\implies\b|\\Rightarrow\b|⇒/g, ' implies '],
  [/\\iff\b|\\Leftrightarrow\b|⇔/g, ' if and only if '],
  [/\\hbar\b|ℏ/g, ' h-bar '],
  [/\\ell\b/g, ' l '],
];

// Standard math functions
const MATH_FUNCTIONS: Record<string, string> = {
  arcsin: 'arc sine of',
  arccos: 'arc cosine of',
  arctan: 'arc tangent of',
  sinh: 'hyperbolic sine of',
  cosh: 'hyperbolic cosine of',
  tanh: 'hyperbolic tangent of',
  sin: 'sine of',
  cos: 'cosine of',
  tan: 'tangent of',
  sec: 'secant of',
  csc: 'cosecant of',
  cot: 'cotangent of',
  ln: 'natural log of',
  log: 'log of',
  exp: 'exponential of',
  det: 'determinant of',
  dim: 'dimension of',
  gcd: 'greatest common divisor of',
  max: 'maximum of',
  min: 'minimum of',
  lim: 'limit',
};

/**
 * Helper to extract balanced curly brace group {...} from a string starting at index.
 * Returns [content, endIndex] or null if no valid group.
 */
function extractBalancedBrace(str: string, startIndex: number): [string, number] | null {
  if (startIndex >= str.length || str[startIndex] !== '{') return null;
  let depth = 0;
  for (let i = startIndex; i < str.length; i++) {
    if (str[i] === '{') depth++;
    else if (str[i] === '}') {
      depth--;
      if (depth === 0) {
        return [str.slice(startIndex + 1, i), i + 1];
      }
    }
  }
  return null;
}

/**
 * Helper to extract balanced square bracket group [...] from a string starting at index.
 */
function extractBalancedBracket(str: string, startIndex: number): [string, number] | null {
  if (startIndex >= str.length || str[startIndex] !== '[') return null;
  let depth = 0;
  for (let i = startIndex; i < str.length; i++) {
    if (str[i] === '[') depth++;
    else if (str[i] === ']') {
      depth--;
      if (depth === 0) {
        return [str.slice(startIndex + 1, i), i + 1];
      }
    }
  }
  return null;
}

/**
 * Recursively parses and converts a single LaTeX math expression into natural spoken English.
 */
export function convertMathExpressionToSpeech(rawExpr: string): string {
  if (!rawExpr || !rawExpr.trim()) return '';

  let expr = rawExpr.trim();

  // Strip wrapping delimiters if present
  expr = expr.replace(/^(\$\$|\$|\\\(|\\\[)([\s\S]*?)(\$\$|\$|\\\)|\\\])$/, '$2').trim();

  // Clean up formatting wrappers like \text{...}, \mathrm{...}, \mathbf{...}, etc.
  expr = expr.replace(/\\(mathrm|mathbf|mathit|mathsf|mathtt|text|textbf|textit|operatorname|displaystyle|textstyle)\{([^{}]*)\}/g, '$2');
  expr = expr.replace(/\\(mathrm|mathbf|mathit|mathsf|mathtt|text|textbf|textit|operatorname|displaystyle|textstyle)\s+([a-zA-Z0-9]+)/g, '$2');

  // Handle \cancel or \boxed
  expr = expr.replace(/\\(boxed|cancel|underline|overline)\{([^{}]*)\}/g, '$2');

  // Remove stylistic \left and \right delimiters
  expr = expr.replace(/\\left\s*([([{\\|.])/g, '$1');
  expr = expr.replace(/\\right\s*([)\]}\\|.])/g, '$1');

  // Handle degree signs: ^\circ or ^\circ C or ^\circ F or °
  expr = expr.replace(/\^\{\\circ\}\s*([CFcf])?/g, (m, unit) => unit ? ` degrees ${unit.toUpperCase()} ` : ' degrees ');
  expr = expr.replace(/\^\\circ\b/g, ' degrees ');
  expr = expr.replace(/\\deg\b|°/g, ' degrees ');

  // Parse and replace \frac{num}{den}, \cfrac, \tfrac using balanced brace parsing
  let fracIdx: number;
  while ((fracIdx = expr.search(/\\(frac|cfrac|tfrac)/)) !== -1) {
    const cmdMatch = expr.slice(fracIdx).match(/^\\(frac|cfrac|tfrac)\s*/);
    if (!cmdMatch) break;
    const cmdLen = cmdMatch[0].length;
    const firstBraceIdx = fracIdx + cmdLen;

    const numGroup = extractBalancedBrace(expr, firstBraceIdx);
    if (!numGroup) {
      // Fallback for single char fractions e.g. \frac 1 2
      const singleCharMatch = expr.slice(fracIdx).match(/^\\(?:frac|cfrac|tfrac)\s+([a-zA-Z0-9])\s+([a-zA-Z0-9])/);
      if (singleCharMatch) {
        const replacement = `${convertMathExpressionToSpeech(singleCharMatch[1])} over ${convertMathExpressionToSpeech(singleCharMatch[2])}`;
        expr = expr.slice(0, fracIdx) + ` ${replacement} ` + expr.slice(fracIdx + singleCharMatch[0].length);
        continue;
      }
      break;
    }

    const [numStr, afterNumIdx] = numGroup;
    // Skip any whitespace between braces
    let denStartIdx = afterNumIdx;
    while (denStartIdx < expr.length && /\s/.test(expr[denStartIdx])) denStartIdx++;

    const denGroup = extractBalancedBrace(expr, denStartIdx);
    if (!denGroup) break;
    const [denStr, afterDenIdx] = denGroup;

    const spokenNum = convertMathExpressionToSpeech(numStr).trim();
    const spokenDen = convertMathExpressionToSpeech(denStr).trim();

    let spokenFrac = `${spokenNum} over ${spokenDen}`;
    if (spokenNum === '1' && spokenDen === '2') spokenFrac = 'one half';
    else if (spokenNum === '1' && spokenDen === '3') spokenFrac = 'one third';
    else if (spokenNum === '2' && spokenDen === '3') spokenFrac = 'two thirds';
    else if (spokenNum === '1' && spokenDen === '4') spokenFrac = 'one quarter';
    else if (spokenNum === '3' && spokenDen === '4') spokenFrac = 'three quarters';
    else if (spokenNum === 'd' && spokenDen === 'dx') spokenFrac = 'd by d x';
    else if (spokenNum.startsWith('d') && spokenDen.startsWith('d')) spokenFrac = `${spokenNum} by ${spokenDen}`;

    expr = expr.slice(0, fracIdx) + ` ${spokenFrac} ` + expr.slice(afterDenIdx);
  }

  // Parse and replace \sqrt[n]{x} and \sqrt{x} using balanced brace parsing
  let sqrtIdx: number;
  while ((sqrtIdx = expr.indexOf('\\sqrt')) !== -1) {
    let afterCmdIdx = sqrtIdx + 5;
    while (afterCmdIdx < expr.length && /\s/.test(expr[afterCmdIdx])) afterCmdIdx++;

    let rootPower = '';
    if (expr[afterCmdIdx] === '[') {
      const bracketGroup = extractBalancedBracket(expr, afterCmdIdx);
      if (bracketGroup) {
        rootPower = convertMathExpressionToSpeech(bracketGroup[0]).trim();
        afterCmdIdx = bracketGroup[1];
        while (afterCmdIdx < expr.length && /\s/.test(expr[afterCmdIdx])) afterCmdIdx++;
      }
    }

    const braceGroup = extractBalancedBrace(expr, afterCmdIdx);
    if (braceGroup) {
      const [bodyStr, afterBraceIdx] = braceGroup;
      const spokenBody = convertMathExpressionToSpeech(bodyStr).trim();
      const spokenRoot = rootPower
        ? (rootPower === '3' ? `the cube root of ${spokenBody}` : `the ${rootPower} root of ${spokenBody}`)
        : `the square root of ${spokenBody}`;

      expr = expr.slice(0, sqrtIdx) + ` ${spokenRoot} ` + expr.slice(afterBraceIdx);
    } else {
      // Single char sqrt fallback \sqrt x
      const singleMatch = expr.slice(sqrtIdx).match(/^\\sqrt\s*([a-zA-Z0-9])/);
      if (singleMatch) {
        const spokenRoot = `the square root of ${singleMatch[1]}`;
        expr = expr.slice(0, sqrtIdx) + ` ${spokenRoot} ` + expr.slice(sqrtIdx + singleMatch[0].length);
      } else {
        break;
      }
    }
  }

  // Handle vectors, hats, dots, bars
  expr = expr.replace(/\\vec\{([^{}]+)\}/g, 'vector $1');
  expr = expr.replace(/\\hat\{([^{}]+)\}/g, '$1 hat');
  expr = expr.replace(/\\bar\{([^{}]+)\}/g, '$1 bar');
  expr = expr.replace(/\\dot\{([^{}]+)\}/g, '$1 dot');
  expr = expr.replace(/\\ddot\{([^{}]+)\}/g, '$1 double dot');
  expr = expr.replace(/\\tilde\{([^{}]+)\}/g, '$1 tilde');

  // Handle binomial coefficients \binom{n}{k}
  expr = expr.replace(/\\binom\{([^{}]+)\}\{([^{}]+)\}/g, '$1 choose $2');

  // Handle limits \lim_{x \to 0} or \lim_{n \to \infty}
  expr = expr.replace(/\\lim_\{([^{}]+)\s*(?:\\to|\\rightarrow|->)\s*([^{}]+)\}/g, (m, varName, target) => {
    return `the limit as ${convertMathExpressionToSpeech(varName)} approaches ${convertMathExpressionToSpeech(target)} of `;
  });
  expr = expr.replace(/\\lim\s+([a-zA-Z])\s*(?:\\to|\\rightarrow|->)\s*([a-zA-Z0-9\\]+)/g, (m, varName, target) => {
    return `the limit as ${varName} approaches ${convertMathExpressionToSpeech(target)} of `;
  });

  // Handle definite integrals \int_{a}^{b} f(x) dx
  expr = expr.replace(/\\int_\{([^{}]+)\}\^\{([^{}]+)\}/g, (m, lower, upper) => {
    return `the integral from ${convertMathExpressionToSpeech(lower)} to ${convertMathExpressionToSpeech(upper)} of `;
  });
  expr = expr.replace(/\\int\^\{([^{}]+)\}_\{([^{}]+)\}/g, (m, upper, lower) => {
    return `the integral from ${convertMathExpressionToSpeech(lower)} to ${convertMathExpressionToSpeech(upper)} of `;
  });
  expr = expr.replace(/\\int_([a-zA-Z0-9])\^([a-zA-Z0-9])/g, (m, lower, upper) => {
    return `the integral from ${lower} to ${upper} of `;
  });
  expr = expr.replace(/\\int\b/g, 'the integral of ');
  expr = expr.replace(/\\iint\b/g, 'the double integral of ');
  expr = expr.replace(/\\iiint\b/g, 'the triple integral of ');
  expr = expr.replace(/\\oint\b/g, 'the contour integral of ');

  // Handle summations \sum_{i=1}^{n} and products \prod_{i=1}^{n}
  expr = expr.replace(/\\sum_\{([^{}]+)\}\^\{([^{}]+)\}/g, (m, lower, upper) => {
    return `the sum from ${convertMathExpressionToSpeech(lower)} to ${convertMathExpressionToSpeech(upper)} of `;
  });
  expr = expr.replace(/\\sum\^\{([^{}]+)\}_\{([^{}]+)\}/g, (m, upper, lower) => {
    return `the sum from ${convertMathExpressionToSpeech(lower)} to ${convertMathExpressionToSpeech(upper)} of `;
  });
  expr = expr.replace(/\\sum_\{([^{}]+)\}/g, (m, lower) => {
    return `the sum over ${convertMathExpressionToSpeech(lower)} of `;
  });
  expr = expr.replace(/\\sum\b/g, 'the sum of ');

  expr = expr.replace(/\\prod_\{([^{}]+)\}\^\{([^{}]+)\}/g, (m, lower, upper) => {
    return `the product from ${convertMathExpressionToSpeech(lower)} to ${convertMathExpressionToSpeech(upper)} of `;
  });
  expr = expr.replace(/\\prod\^\{([^{}]+)\}_\{([^{}]+)\}/g, (m, upper, lower) => {
    return `the product from ${convertMathExpressionToSpeech(lower)} to ${convertMathExpressionToSpeech(upper)} of `;
  });
  expr = expr.replace(/\\prod_\{([^{}]+)\}/g, (m, lower) => {
    return `the product over ${convertMathExpressionToSpeech(lower)} of `;
  });
  expr = expr.replace(/\\prod\b/g, 'the product of ');

  // Replace Greek letters (\alpha -> alpha)
  for (const [key, val] of Object.entries(GREEK_LETTERS)) {
    const regex = new RegExp(`\\\\${key}\\b`, 'g');
    expr = expr.replace(regex, ` ${val} `);
  }

  // Replace math operators and relations
  for (const [regex, replacement] of MATH_OPERATORS) {
    expr = expr.replace(regex, replacement);
  }

  // Replace math functions (\sin, \cos, \ln, etc.)
  for (const [fn, spoken] of Object.entries(MATH_FUNCTIONS)) {
    const regex = new RegExp(`\\\\${fn}\\b`, 'g');
    expr = expr.replace(regex, ` ${spoken} `);
  }

  // Handle differential terms like dx, dy, dt at the end of integrals or equations
  expr = expr.replace(/\bd([xyzrtuvw])\b/g, ' d $1');

  // Handle superscripts / powers: x^2 -> x squared, x^3 -> x cubed, x^{n} -> x to the power of n
  expr = expr.replace(/([a-zA-Z0-9\)])\^\{([^{}]+)\}/g, (match, base, exp) => {
    const spokenExp = convertMathExpressionToSpeech(exp).trim();
    if (spokenExp === '2' || spokenExp === 'two') return `${base} squared`;
    if (spokenExp === '3' || spokenExp === 'three') return `${base} cubed`;
    if (spokenExp === '-1' || spokenExp === 'minus 1') return `${base} inverse`;
    if (spokenExp === 'T') return `${base} transpose`;
    return `${base} to the power of ${spokenExp}`;
  });

  expr = expr.replace(/([a-zA-Z0-9\)])\^([a-zA-Z0-9])/g, (match, base, exp) => {
    if (exp === '2') return `${base} squared`;
    if (exp === '3') return `${base} cubed`;
    return `${base} to the power of ${exp}`;
  });

  // Handle subscripts: x_i -> x sub i, a_{n+1} -> a sub n plus 1
  expr = expr.replace(/([a-zA-Z0-9\)])_\{([^{}]+)\}/g, (m, base, sub) => {
    return `${base} sub ${convertMathExpressionToSpeech(sub).trim()}`;
  });
  expr = expr.replace(/([a-zA-Z0-9\)])_([a-zA-Z0-9])/g, '$1 sub $2');

  // Clean up remaining backslashes and LaTeX spacing macros
  expr = expr.replace(/\\,/g, ' ');
  expr = expr.replace(/\\;/g, ' ');
  expr = expr.replace(/\\!/g, '');
  expr = expr.replace(/\\quad/g, ' ');
  expr = expr.replace(/\\qquad/g, ' ');
  expr = expr.replace(/\\([a-zA-Z]+)/g, '$1');

  // Standard symbols into natural speech
  expr = expr.replace(/=/g, ' equals ');
  expr = expr.replace(/\+/g, ' plus ');
  expr = expr.replace(/-/g, ' minus ');
  expr = expr.replace(/\*/g, ' times ');
  expr = expr.replace(/\//g, ' divided by ');
  expr = expr.replace(/</g, ' is less than ');
  expr = expr.replace(/>/g, ' is greater than ');
  expr = expr.replace(/!/g, ' factorial ');

  // Clean multiple whitespaces
  expr = expr.replace(/\s+/g, ' ').trim();

  return expr;
}

/**
 * Prepares an entire message for speech synthesis:
 * - Detects inline and display LaTeX blocks ($...$, $$...$$, \[...\], \(...\))
 * - Converts LaTeX math into spoken language
 * - Cleans up markdown formatting (headers, asterisks, bullet points, code ticks)
 * - Normalizes pauses and punctuation so speech synthesis flows naturally.
 */
export function prepareTextForSpeech(text: string): string {
  if (!text) return '';

  let speechText = text;

  // 1. Convert display math blocks: $$ ... $$ and \[ ... \] and \begin{equation} ... \end{equation}
  speechText = speechText.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
    return ` (Formula: ${convertMathExpressionToSpeech(formula)}) `;
  });

  speechText = speechText.replace(/\\\[([\s\S]*?)\\\]/g, (match, formula) => {
    return ` (Formula: ${convertMathExpressionToSpeech(formula)}) `;
  });

  speechText = speechText.replace(/\\begin\{(?:equation|align|gather|multline)\*?\}([\s\S]*?)\\end\{(?:equation|align|gather|multline)\*?\}/g, (match, formula) => {
    return ` (Formula: ${convertMathExpressionToSpeech(formula)}) `;
  });

  // 2. Convert inline math blocks: $ ... $ and \( ... \)
  // Match single dollar expressions not preceded by another dollar
  speechText = speechText.replace(/\$([^\$\n]+?)\$/g, (match, formula) => {
    return ` ${convertMathExpressionToSpeech(formula)} `;
  });

  speechText = speechText.replace(/\\\(([\s\S]*?)\\\)/g, (match, formula) => {
    return ` ${convertMathExpressionToSpeech(formula)} `;
  });

  // 3. Catch standalone LaTeX commands that might not be wrapped in dollars (e.g. \frac{a}{b}, \alpha, \sqrt{x})
  if (
    speechText.includes('\\frac') ||
    speechText.includes('\\sqrt') ||
    speechText.includes('\\sum') ||
    speechText.includes('\\int') ||
    speechText.includes('\\alpha') ||
    speechText.includes('\\beta') ||
    speechText.includes('\\pi') ||
    speechText.includes('\\theta')
  ) {
    speechText = speechText.replace(/(\\[a-zA-Z]+(?:\{[^{}]*\}|\[[^\[\]]*\])*)/g, (match) => {
      return convertMathExpressionToSpeech(match);
    });
  }

  // 4. Clean Markdown symbols for smooth voice reading
  // Code blocks: replace ```lang ... ``` with "Code snippet:"
  speechText = speechText.replace(/```[a-zA-Z0-9_-]*\n?([\s\S]*?)```/g, (match, code) => {
    return ` Code block containing: ${code.slice(0, 150)} `;
  });

  // Inline code: `variable` -> variable
  speechText = speechText.replace(/`([^`]+)`/g, '$1');

  // Markdown headers: # Title -> Title.
  speechText = speechText.replace(/^#{1,6}\s+(.+)$/gm, '$1. ');

  // Bold & Italic asterisks/underscores: **text** -> text
  speechText = speechText.replace(/\*\*([^*]+)\*\*/g, '$1');
  speechText = speechText.replace(/\*([^*]+)\*/g, '$1');
  speechText = speechText.replace(/__([^_]+)__/g, '$1');

  // Bullet points: - item or * item -> item
  speechText = speechText.replace(/^[\*\-•]\s+/gm, ', ');

  // Numbered lists: 1. item -> item
  speechText = speechText.replace(/^\d+\.\s+/gm, ', ');

  // Links: [Text](URL) -> Text
  speechText = speechText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Clean excessive spaces, tabs, and newlines
  speechText = speechText.replace(/[\n\r]+/g, '. ');
  speechText = speechText.replace(/\s+/g, ' ');
  speechText = speechText.replace(/\.\s*\./g, '.');

  return speechText.trim();
}
