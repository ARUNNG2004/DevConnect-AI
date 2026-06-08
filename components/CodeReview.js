'use client';

import { useState } from 'react';

export default function CodeReview() {
  const [code, setCode] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [review, setReview] = useState(null);
  const [activeTab, setActiveTab] = useState('results');
  const [copied, setCopied] = useState(false);

  const handleReview = async () => {
    if (!code.trim()) {
      alert('Please paste some code to review');
      return;
    }

    setIsReviewing(true);
    setReview(null);
    setActiveTab('results');

    try {
      const response = await fetch('/api/code-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await response.json();
      
      if (data.success) {
        setReview(data.review);
      } else {
        alert(data.error || 'Review failed');
      }
    } catch (error) {
      console.error('Review error:', error);
      alert('Failed to review code. Please try again.');
    } finally {
      setIsReviewing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreEmoji = (score) => {
    if (score >= 8) return '🟢';
    if (score >= 6) return '🟡';
    return '🔴';
  };

  const getScoreText = (score) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Needs Improvement';
    return 'Poor';
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #a855f7, #3b82f6)', color: 'white', padding: '8px 20px', borderRadius: '999px', fontSize: '14px', marginBottom: '16px' }}>
          <span>🤖</span>
          <span>AI Code Review</span>
        </div>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '12px' }}>
          Instant <span style={{ background: 'linear-gradient(135deg, #a855f7, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Code Analysis</span>
        </h2>
        <p style={{ color: '#9ca3af' }}>Security, performance, and best practice checks</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Input Section */}
        <div style={{ background: '#1f2937', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <label style={{ fontWeight: '500', color: '#e5e7eb' }}>📝 Your Code</label>
            <button
              onClick={handleReview}
              disabled={isReviewing}
              style={{
                background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '500',
                cursor: isReviewing ? 'not-allowed' : 'pointer',
                opacity: isReviewing ? 0.6 : 1
              }}
            >
              {isReviewing ? 'Analyzing...' : '✨ Review'}
            </button>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder='function calculate(items) {
  var total = 0;
  for(var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }
  console.log(total);
  return total;
}'
            style={{
              width: '100%',
              height: '320px',
              background: '#111827',
              border: '1px solid #374151',
              borderRadius: '12px',
              padding: '16px',
              color: '#d1d5db',
              fontFamily: 'monospace',
              fontSize: '13px',
              resize: 'vertical'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>JavaScript, TypeScript, React, Python</span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>10 reviews/hour</span>
          </div>
        </div>

        {/* Results Section */}
        <div style={{ background: '#1f2937', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', borderBottom: '1px solid #374151', paddingBottom: '12px' }}>
            <button
              onClick={() => setActiveTab('results')}
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                background: activeTab === 'results' ? '#a855f7' : 'transparent',
                color: activeTab === 'results' ? 'white' : '#9ca3af',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              📊 Results
            </button>
            {review?.fixed_code && (
              <button
                onClick={() => setActiveTab('fixed')}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  background: activeTab === 'fixed' ? '#a855f7' : 'transparent',
                  color: activeTab === 'fixed' ? 'white' : '#9ca3af',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                ✅ Fixed Code
              </button>
            )}
          </div>
          
          {!review ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
              <p>Click "Review" to analyze your code</p>
            </div>
          ) : activeTab === 'results' ? (
            <div>
              {/* Score */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: '#111827', marginBottom: '12px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: review.quality_score >= 8 ? '#22c55e' : review.quality_score >= 6 ? '#eab308' : '#ef4444' }}>
                    {review.quality_score}
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Quality Score /10</div>
                <div style={{ fontSize: '11px', color: '#a855f7', marginTop: '4px' }}>{getScoreEmoji(review.quality_score)} {getScoreText(review.quality_score)}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Language: {review.language}</div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: '#111827', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>{review.summary?.total_issues || 0}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Issues</div>
                </div>
                <div style={{ background: '#111827', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>{review.summary?.security_issues || 0}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Security</div>
                </div>
                <div style={{ background: '#111827', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#eab308' }}>{review.summary?.performance_issues || 0}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Performance</div>
                </div>
              </div>

              {/* Issues */}
              {review.issues && review.issues.length > 0 ? (
                <div style={{ maxHeight: '280px', overflow: 'auto' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#e5e7eb' }}>Issues Found:</h4>
                  {review.issues.map((issue, idx) => (
                    <div key={idx} style={{ background: '#111827', padding: '12px', borderRadius: '8px', marginBottom: '8px', borderLeft: `3px solid ${issue.severity === 'Critical' ? '#ef4444' : issue.severity === 'High' ? '#f97316' : '#eab308'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: issue.severity === 'Critical' ? '#ef4444' : issue.severity === 'High' ? '#f97316' : '#eab308', color: 'white' }}>{issue.severity}</span>
                        <span style={{ fontSize: '10px', color: '#6b7280' }}>{issue.type}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#d1d5db' }}>{issue.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: '#22c55e20', border: '1px solid #22c55e50', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                  <h4 style={{ color: '#22c55e', fontWeight: '600', marginBottom: '4px' }}>Excellent Code!</h4>
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>No issues found. Great work!</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <pre style={{ background: '#111827', padding: '16px', borderRadius: '12px', overflow: 'auto', maxHeight: '400px' }}>
                <code style={{ fontSize: '12px', color: '#d1d5db', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{review.fixed_code}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(review.fixed_code)}
                style={{
                  marginTop: '16px',
                  width: '100%',
                  padding: '10px',
                  background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {copied ? '✓ Copied!' : '📋 Copy Fixed Code'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}