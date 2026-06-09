// Rate limiting store
const userReviews = new Map();

export async function POST(request) {
  try {
    const { code } = await request.json();
    
    if (!code || code.trim().length === 0) {
      return Response.json({ error: 'No code provided' }, { status: 400 });
    }
    
    // Rate limiting (10 per hour)
    const now = Date.now();
    const userHistory = userReviews.get('anonymous') || [];
    const recentReviews = userHistory.filter(time => now - time < 3600000);
    
    if (recentReviews.length >= 10) {
      return Response.json({ error: 'Rate limit: 10 reviews per hour' }, { status: 429 });
    }
    
    userReviews.set('anonymous', [...recentReviews, now]);
    
    // Detect issues
    const issues = [];
    
    // Strip comments first to avoid false positives inside comments
    const cleanCode = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
    
    // Security issues
    if (/eval\(/g.test(cleanCode)) {
      issues.push({ type: 'security', severity: 'Critical', message: 'Never use eval() - security risk' });
    }
    if (/innerHTML\s*=/g.test(cleanCode)) {
      issues.push({ type: 'security', severity: 'High', message: 'innerHTML can cause XSS attacks' });
    }
    
    // Performance issues
    if (/for\s*\([^)]*\)\s*\{[^{}]*for\s*\([^)]*\)/s.test(cleanCode) ||
        /for\s*\([^)]*\)\s*(?!\{)\s*for\s*\([^)]*\)/s.test(cleanCode)) {
      issues.push({ type: 'performance', severity: 'Medium', message: 'Nested loops - O(n²) complexity' });
    }
    
    // Best practices
    if (/var\s+/g.test(cleanCode)) {
      issues.push({ type: 'best_practice', severity: 'Low', message: 'Use const/let instead of var' });
    }
    if (/console\.log/g.test(cleanCode)) {
      issues.push({ type: 'best_practice', severity: 'Low', message: 'Remove console.log in production' });
    }
    
    // Calculate score
    let score = 10;
    for (const issue of issues) {
      if (issue.severity === 'Critical') score -= 2;
      else if (issue.severity === 'High') score -= 1.5;
      else if (issue.severity === 'Medium') score -= 1;
      else score -= 0.5;
    }
    const qualityScore = Math.max(0, Math.min(10, Math.round(score * 10) / 10));
    
    // Detect language
    let language = 'JavaScript';
    if (code.includes('import React') || code.includes('useState')) language = 'React';
    if (code.includes(':') && code.includes('interface')) language = 'TypeScript';
    if (code.includes('def ') && !code.includes(';')) language = 'Python';
    
    // Generate fixed code
    let fixedCode = code;
    fixedCode = fixedCode.replace(/var\s+/g, 'let ');
    fixedCode = fixedCode.replace(/console\.log\(([\s\S]*?)\)/g, 'void 0 /* console.log removed */');
    
    return Response.json({
      success: true,
      review: {
        quality_score: qualityScore,
        language: language,
        issues: issues,
        fixed_code: fixedCode !== code ? fixedCode : null,
        summary: {
          total_issues: issues.length,
          security_issues: issues.filter(i => i.type === 'security').length,
          performance_issues: issues.filter(i => i.type === 'performance').length,
          best_practice_issues: issues.filter(i => i.type === 'best_practice').length,
        }
      }
    });
    
  } catch (error) {
    console.error('Code review error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}