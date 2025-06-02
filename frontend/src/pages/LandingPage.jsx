import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { FaChartLine, FaUsers, FaCertificate, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navigation functions
  const goToLogin = () => navigate('/login');
  const goToRegister = () => navigate('/register');
  const nextSlide = () => setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1));
  const goToSlide = (index) => setCurrentSlide(index);

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, []);

  // Features data
  const features = [
    {
      icon: <FaChartLine className="text-primary fs-1 mb-3" />,
      title: "Skill Tracking",
      description: "Monitor and manage employee skills with our intuitive dashboard."
    },
    {
      icon: <FaUsers className="text-primary fs-1 mb-3" />,
      title: "Team Insights",
      description: "Gain valuable insights into your team's capabilities."
    },
    {
      icon: <FaCertificate className="text-primary fs-1 mb-3" />,
      title: "Certifications",
      description: "Track professional certifications and training progress."
    }
  ];

  // Slides content
  const slides = [
    // Slide 1: Hero section
    <div key={0} className="carousel-slide d-flex flex-column justify-content-center align-items-center">
      <div className="container text-center px-4">
        <h1 className={`fw-bold mb-4 ${isMobile ? 'display-4' : 'display-3'}`}>
          <span className="text-primary">Employee Skill Inventory Tracker</span> 
        </h1>
        <p className={`lead mb-5 ${isMobile ? 'fs-4' : 'fs-3'}`}>
          Optimize your workforce with comprehensive skill management
        </p>
        <div className={`d-flex ${isMobile ? 'flex-column' : 'flex-row'} gap-3 justify-content-center`}>
          <button 
            onClick={goToLogin} 
            className="btn btn-primary btn-lg px-4 py-3 fw-bold"
          >
            Get Started <FaArrowRight className="ms-2" />
          </button>
          <button 
            onClick={goToRegister} 
            className="btn btn-outline-primary btn-lg px-4 py-3 fw-bold"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>,

    // Slide 2: Features
    <div key={1} className="carousel-slide d-flex flex-column justify-content-center align-items-center">
      <div className="container px-4">
        <h2 className="text-center fw-bold mb-5 display-5">
           <span className="text-primary">Powerful Features</span>
        </h2>
        <div className="row g-4">
          {features.map((feature, index) => (
            <div className="col-md-4" key={index}>
              <div className="h-100 p-4 bg-light rounded-3 shadow-sm border">
                {feature.icon}
                <h3 className="h4 fw-bold mb-3">{feature.title}</h3>
                <p className="text-muted">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,

    // Slide 3: Testimonial
    <div key={2} className="carousel-slide d-flex flex-column justify-content-center align-items-center">
      <div className="container text-center px-4" style={{ maxWidth: '800px' }}>
        <div className="bg-light p-5 rounded-3 shadow-sm border">
          <blockquote className="fs-4 fst-italic text-muted mb-4">
            “Performance leads to recognition. Recognition brings respect. Respect enhances power. Humility and grace in one’s moments of power enhances the dignity of an organization.”
          </blockquote>
          <p className="h5 fw-bold">- N. R. Narayana Murthy</p>
        </div>
      </div>
    </div>
  ];

  return (
    <div className="bg-white" style={{ minHeight: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Carousel container */}
      <div 
        className="d-flex transition-all" 
        style={{ 
          transform: `translateX(-${currentSlide * 100}%)`,
          height: '100vh',
          transition: 'transform 0.5s ease'
        }}
      >
        {slides}
      </div>

      {/* Navigation arrows */}
      {!isMobile && (
        <>
          <button 
            onClick={prevSlide}
            className="btn btn-light rounded-circle p-3 shadow-sm border"
            style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10
            }}
          >
            <FaArrowLeft className="fs-4" />
          </button>
          <button 
            onClick={nextSlide}
            className="btn btn-light rounded-circle p-3 shadow-sm border"
            style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10
            }}
          >
            <FaArrowRight className="fs-4" />
          </button>
        </>
      )}

      {/* Navigation dots */}
      <div className="d-flex gap-2 justify-content-center" style={{
        position: 'absolute',
        bottom: '20px',
        left: '0',
        right: '0',
        zIndex: 10
      }}>
        {slides.map((_, index) => (
          <button 
            key={index}
            onClick={() => goToSlide(index)}
            className={`btn p-0 rounded-circle ${index === currentSlide ? 'bg-primary' : 'bg-secondary'}`}
            style={{ width: '12px', height: '12px' }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Inline styles for carousel slides */}
      <style>{`
        .carousel-slide {
          min-width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          box-sizing: border-box;
        }
        .transition-all {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
