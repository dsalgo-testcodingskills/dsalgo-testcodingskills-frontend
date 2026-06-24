import { useHistory } from 'react-router';
import './LandingPage.scss';

function LandingPage() {
  const history = useHistory();

  const handleGetStarted = () => history.push('/register');

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <div className="eyebrow">The Technical Assessment Platform</div>
            <h1>
              Hire talented developers, <span>confidently.</span>
            </h1>
            <p className="hero-desc">
              Test real coding skills with automated assessments.<br />
              Eliminate guesswork and hire the best engineers faster.
            </p>

            <div className="hero-ctas">
              <button className="btn-primary" onClick={handleGetStarted}>
                Get Started Free
              </button>
              <button 
                className="btn-secondary"
                onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
              >
                See How It Works
              </button>
            </div>

            <div className="lang-tags">
              <span>Python</span>
              <span>JavaScript</span>
              <span>TypeScript</span>
              <span>Java</span>
              <span>Go</span>
              <span>C++</span>
              <span>Rust</span>
              <span>C#</span>
            </div>
          </div>

          <div className="hero-image">
            <img 
              src="/images/landingImg.svg" 
              alt="Developer using ALGO platform" 
            />
          </div>
        </div>
      </section>

      {/* VIDEO SECTION */}
      {/* <section className="video-section">
        <div className="video-container">
          <div className="video-text">
            <h2>Watch what ALGO can do for you</h2>
            <p>3-minute overview by our CEO</p>
          </div>
          <div className="video-wrapper">
            <video
              poster="/images/videoThubnail.png"
              controls
              className="video-player"
            >
              <source src="https://timeloggerautoupdate.s3.ap-south-1.amazonaws.com/test-demo-processed.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section> */}

      <section className="features" id="features">
        <div className="section-header">
          <h2>Everything you need to evaluate engineers</h2>
          <p>Powerful tools to build your question library and run assessments at scale.</p>
        </div>

        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="how-it-works" id="how-it-works">
        <div className="section-header">
          <h2>How it works</h2>
          <p>Streamline your hiring process in four simple steps.</p>
        </div>

        <div className="steps-list">
          {steps.map((step, i) => (
            <div key={i} className="step-item">
              <div className="step-number">{String(i + 1).padStart(2, '0')}</div>
              <div>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      
    </div>
  );
}
const features = [
  { 
    icon: "✍️", 
    title: "Custom Question Builder", 
    desc: "Create coding challenges with custom test cases, edge cases, and support for 9+ languages." 
  },
  { 
    icon: "⚡", 
    title: "Automated Evaluation", 
    desc: "Instant, unbiased grading with detailed execution reports and code quality insights." 
  },
  { 
    icon: "🏢", 
    title: "Organization Workspaces", 
    desc: "Secure team management with separate test libraries and candidate pools." 
  },
  { 
    icon: "📹", 
    title: "Webcam Proctoring", 
    desc: "Maintain integrity with automated screenshots and tab-switching detection." 
  },
  { 
    icon: "📈", 
    title: "Detailed Analytics", 
    desc: "Performance percentiles, time metrics, and intelligent candidate comparison." 
  },
  { 
    icon: "🔄", 
    title: "Seamless Workflow", 
    desc: "Invite candidates, track progress in real-time, and manage your entire pipeline." 
  }
];
const steps = [
  { title: "Create Test", desc: "Select or build questions, set duration, and configure proctoring options." },
  { title: "Invite Candidates", desc: "Send secure links. Candidates can attempt the test at their convenience." },
  { title: "Code Execution", desc: "Our high-performance system evaluates submissions against comprehensive test cases." },
  { title: "Hire the Best", desc: "Review rich reports and advance top performers to the next stage." }
];

export default LandingPage;
