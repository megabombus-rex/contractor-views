import React, { useState } from 'react';
import { Button } from '../ui/button/button'; // Adjust import path as needed

const WelcomePage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Form submitted:', formData);
    alert(`Welcome, ${formData.name}! Form submitted successfully.`);
    
    setIsSubmitting(false);
    setFormData({ name: '', email: '' });
  };

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1>Welcome to Our Platform</h1>
        <p>Get started by filling out the form below to join our community.</p>
        
        <form onSubmit={handleSubmit} className="welcome-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email address"
            />
          </div>
          
          <div className="form-actions">
            <Button
              type="submit"
              size="large"
              loading={isSubmitting}
              disabled={!formData.name || !formData.email}
            >
              Submit
            </Button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .welcome-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .welcome-content {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          max-width: 500px;
          width: 100%;
        }

        h1 {
          color: #333;
          text-align: center;
          margin-bottom: 16px;
          font-size: 2.5rem;
          font-weight: 700;
        }

        p {
          color: #666;
          text-align: center;
          margin-bottom: 32px;
          font-size: 1.1rem;
          line-height: 1.6;
        }

        .welcome-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        label {
          font-weight: 600;
          color: #333;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        input {
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s ease;
          outline: none;
        }

        input:focus {
          border-color: #667eea;
        }

        input::placeholder {
          color: #999;
        }

        .form-actions {
          margin-top: 16px;
          display: flex;
          justify-content: center;
        }

        @media (max-width: 640px) {
          .welcome-content {
            padding: 24px;
            margin: 20px;
          }
          
          h1 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default WelcomePage;