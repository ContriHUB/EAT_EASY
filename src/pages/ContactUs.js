import React from "react";
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import './contactUs.css'
const ContactForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    message: ''
  });

  const [emailError, setEmailError] = useState('');
  const [messageError, setMessageError] = useState('');

  async function Backendhit() {
    try{
      let response = await fetch("/contactUs",{
      method:"POST",
      headers: {
          'Content-Type': 'application/json'
      },
      body:JSON.stringify(formData)
      });
      console.log("object created");
      let result = await response.json();
      // alert("Message was submitted successfully");
      Swal.fire({
        icon: 'success',
        title: 'Form Submitted',
        text: 'Thank you for your message!',
        confirmButtonText: 'OK'
      });
      
  }
  catch{
      console.log("some Error Has occured while creation")
      // alert(" Oops!!! Some Error occured, RETRY Please !!");
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please fix the errors and try again!'
      });

  }   
  setFormData({
    email: '',
    name: '',
    message: ''
  });
  setEmailError('');
  setMessageError('');         
    
}

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateMessage = (message) => {
    return message.length >= 10;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let isValid = true;

    // Validate Email
    if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Validate Message Length
    if (!validateMessage(formData.message)) {
      setMessageError('Message too short. It should be at least 10 characters.');
      isValid = false;
    } else {
      setMessageError('');
    }

    if (isValid) {
      console.log('Form submitted: ', formData);
      Backendhit();
    }
  };

  return (
    <>
    <div className="contact-container">
      
    <h2 className="text-center">Contact Us</h2>
    <form onSubmit={handleSubmit} className="contact-form">
      <div className="form-group mb-3 email-field">
        <label htmlFor="email" className="form-label">
          Email address <span className="required">*</span>
        </label>
        <input 
          type="email" 
          className={`form-control ${emailError ? 'is-invalid' : ''}`} 
          id="email" 
          name="email" 
          value={formData.email} 
          onChange={handleChange} 
          placeholder="name@example.com" 
          required 
        />
        {emailError && <div className="invalid-feedback">{emailError}</div>}
      </div>

      <div className="form-group mb-3 name-field">
        <label htmlFor="name" className="form-label">Your Name</label>
        <input 
          type="text" 
          className="form-control" 
          id="name" 
          name="name" 
          value={formData.name} 
          onChange={handleChange} 
          placeholder="Your Name" 
        />
      </div>

      <div className="form-group mb-3 message-field">
        <label htmlFor="message" className="form-label">
          Message <span className="required">*</span>
        </label>
        <textarea 
          className={`form-control ${messageError ? 'is-invalid' : ''}`} 
          id="message" 
          name="message" 
          value={formData.message} 
          onChange={handleChange} 
          rows="4" 
          placeholder="What is in your mind? Any suggestion/complaint/query" 
          required 
        />
        {messageError && <div className="invalid-feedback">{messageError}</div>}
      </div>

      <button type="submit" className="btn btn-submit2 w-100">Submit</button>
    </form>
  </div>
  </>
  );
  
};

export default ContactForm;
