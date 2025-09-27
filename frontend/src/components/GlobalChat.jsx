import { useEffect, useRef, useState } from "react";
import { socket, updateSocketAuth } from "../lib/socket";
import { speakText } from "../lib/speech";
import AIicon from "../assets/AiAnimation.webm";
import { useNavigate, useLocation } from "react-router-dom";
import { useChat } from "../contexts/ChatContext";
import sessionManager from "../lib/sessionManager";

export default function GlobalChat() {
  const [transcript1, setTranscript] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [tempMessage, setTempMessage] = useState("");
  const recognitionRef = useRef(null);
  const transcriptRef = useRef(transcript1);
  const accumulatedTranscriptRef = useRef("");
  const chatStatusref = useRef(false);
  const loopref = useRef(false);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const userLocation = useRef();
  const videoRef = useRef(null);
  const initialtext = "Hello! I'm your Personal Business Assistant. I can help you manage your business operations, create schedules, assign tasks, and navigate your dashboard. How may I assist you today?";
  
  // Use chat context
  const {
    chatVisibility,
    setChatVisibility,
    messages,
    addMessage,
    clearChat,
    clearSession,
    isTyping,
    setIsTyping,
    currentMessage,
    setCurrentMessage
  } = useChat();

  // Get user coordinates
  useEffect(() => {
    async function getCoordinates() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log(position.coords.latitude, position.coords.longitude);
            userLocation.current = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
          },
          (err) => {
            console.error(err.message);
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    }
    getCoordinates();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if chat should be open based on sessionStorage
  useEffect(() => {
    const chatActive = sessionManager.getItem("chatActive", false);
    if (chatActive) {
      setChatVisibility(true);
      chatStatusref.current = true;
    } else {
      // Ensure chat starts closed
      setChatVisibility(false);
      chatStatusref.current = false;
    }
  }, [setChatVisibility]);

  useEffect(() => {
    transcriptRef.current = transcript1;
  }, [transcript1]);

  const startChat = () => {
    // Update socket auth with current Google ID from localStorage
    updateSocketAuth();
    
    // Get user data and role from localStorage
    const getUserData = () => {
      try {
        const ownerData = localStorage.getItem('ownerData');
        const employeeId = localStorage.getItem('employeeId');
        
        if (ownerData) {
          const parsedOwnerData = JSON.parse(ownerData);
          return {
            id: parsedOwnerData.googleId || parsedOwnerData.id || null,
            role: "owner"
          };
        } else if (employeeId) {
          return {
            id: employeeId,
            role: "employee"
          };
        }
      } catch (error) {
        console.error('Error parsing localStorage data:', error);
      }
      return { id: null, role: "anonymous" };
    };
    
    const userData = getUserData();
    if (userData.id) {
      console.log('Socket connecting with:', userData);
    } else {
      console.warn('No user data found, connecting as anonymous');
    }

    socket.connect();

    socket.on("connect", () => {
      console.log('Socket connected with ID:', socket.id);
      console.log('Socket auth:', socket.auth);
      
      // Speak the initial greeting after socket connection is established
      const textToSpeak = initialtext;
      speakText(textToSpeak);
    });

    startRecognition();
  };

  useEffect(() => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        console.log(result);
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          // Clear previous timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          // Set new timeout
          timeoutRef.current = setTimeout(() => {
            recognitionRef.current.stop();
            console.log("stopped by timeout");
          }, 2500);
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      accumulatedTranscriptRef.current += finalTranscript;
      const currentTranscript = accumulatedTranscriptRef.current + interimTranscript;
      setTranscript(currentTranscript);
      
      // Show real-time transcript as temporary user message
      if (currentTranscript.trim()) {
        setIsSpeaking(true);
        setTempMessage(currentTranscript);
      }
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Clear temporary speaking state
      setIsSpeaking(false);
      setTempMessage("");
      
      if (accumulatedTranscriptRef.current) {
        console.log(accumulatedTranscriptRef.current);
        
        // Add user message to chat
        addMessage('user', accumulatedTranscriptRef.current);
        setIsTyping(true);
        
        socket.emit("prompt", accumulatedTranscriptRef.current);
      }
      accumulatedTranscriptRef.current = "";
      setTranscript(accumulatedTranscriptRef.current);
      if (loopref.current) {
        startRecognition();
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
    };

    recognitionRef.current = recognition;
  }, [addMessage, setIsTyping]);

  // Handle schedule creation
  const handleScheduleCreation = (scheduleData) => {
    addMessage('ai', `Great! I've created your schedule. It has been saved to your account.`);
  };

  useEffect(() => {
    const handleResponse = (response) => {
      console.log(response);
      setIsTyping(false);

      // Add AI response to messages
      addMessage('ai', response);

      const first_index = response.indexOf(`{`);
      const last_index = response.lastIndexOf(`}`);
      

      if (first_index > -1 && last_index > -1) {
        const json_extract = response.slice(first_index, last_index + 1);
        try {
          const response_json = JSON.parse(json_extract);
          console.log(response_json);
          
          // Handle different types of JSON responses
          if (response_json["data-type"] === "SAVE_SCHEDULE") {
            // Handle schedule creation
            handleScheduleCreation(response_json);
            speakText("I've created and saved your schedule successfully!");
            return;
          }
        } catch (e) {
          console.log("Could not parse JSON response:", e);
        }
      }

      const parts = response.split(" ");
      let pagename;

      // If the command starts with "open", process it
      if (parts[0].toLowerCase() === "open") {
        pagename = parts.slice(1).join(" ").replace(/\s+/g, "").toLowerCase();

        console.log(pagename);

        // Define a mapping of possible variations to correct routes
        const pageRoutes = {
          home: "/",
          homepage: "/",
          dashboard: "/owner/dashboard",
          ownerdashboard: "/owner/dashboard",
          businessprofile: "/owner/business-profile",
          business: "/owner/business-profile",
          staffmanagement: "/owner/staff-management",
          staff: "/owner/staff-management",
          scheduledashboard: "/owner/schedule-dashboard",
          ownerschedule: "/owner/schedule-dashboard",
          employeedashboard: "/employee/dashboard",
          employeeschedule: "/employee/schedule",
          profile: "/profile",
          profilepage: "/profile",
          payroll: "/payroll",
          training: "/training"
        };
        

        // Check if the normalized page name exists in the mapping
        if (pageRoutes[pagename]) {
          speakText(`opening ${pagename}`);
          navigate(pageRoutes[pagename]);
        } else {
          speakText("Invalid page name");
        }
      } else {
        speakText(response);
      }
      startRecognition();
    };

    // Handle schedule saved event
    const handleScheduleSaved = (data) => {
      addMessage('ai', `✅ ${data.message}`);
      speakText(data.message);
    };

    socket.on("response", handleResponse);
    socket.on("schedule_saved", handleScheduleSaved);

    return () => {
      socket.off("response", handleResponse);
      socket.off("schedule_saved", handleScheduleSaved);
    };
  }, [addMessage, setIsTyping, navigate]);

  const startRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Clear temporary speaking state
      setIsSpeaking(false);
      setTempMessage("");
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.stop();
      loopref.current = false;
      console.log("Recognition stopped manually", loopref.current);
    }
  };

  // Handle text input
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (currentMessage.trim()) {
      addMessage('user', currentMessage);
      setIsTyping(true);
      socket.emit("prompt", currentMessage);
      setCurrentMessage("");
    }
  };

  // Enhanced toggle chat with socket management
  const handleToggleChat = () => {
    if (!chatVisibility) {
      startChat();
      sessionManager.setItem("chatActive", true);
      setChatVisibility(true);
      loopref.current = true;
      if (videoRef.current) {
        videoRef.current.play();
      }
    } else {
      stopRecognition();
      sessionManager.setItem("chatActive", false);
      setChatVisibility(false);
      loopref.current = false;
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  };

  return (
    <>
      {/* Floating AI Button */}
      <button
        className="button AIbutton second-step"
        id="AIbutton"
        onClick={handleToggleChat}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <video
          ref={videoRef}
          src={AIicon}
          alt="AI Icon Video"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%'
          }}
          muted
          loop
        />
      </button>

      {/* Chat Popup */}
      {chatVisibility && (
        <div 
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '350px',
            height: '500px',
            backgroundColor: 'white',
            borderRadius: '15px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #e0e0e0'
          }}
        >
          {/* Chat Header */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Business Assistant</h3>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Your Personal Business Management AI</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={clearChat}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                title="Clear chat messages"
              >
                Clear
              </button>
              <button
                onClick={clearSession}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                title="Clear session (resets everything)"
              >
                Reset
              </button>
              <button
                onClick={() => setChatVisibility(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  padding: '5px',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
                title="Close chat"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '10px'
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '10px 15px',
                    borderRadius: message.type === 'user' ? '15px 15px 5px 15px' : '15px 15px 15px 5px',
                    backgroundColor: message.type === 'user' ? '#667eea' : '#f0f0f0',
                    color: message.type === 'user' ? 'white' : '#333',
                    fontSize: '14px',
                    lineHeight: '1.4',
                    wordWrap: 'break-word'
                  }}
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {/* Temporary speaking message */}
            {isSpeaking && tempMessage && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: '10px'
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '10px 15px',
                    borderRadius: '15px 15px 5px 15px',
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    fontSize: '14px',
                    lineHeight: '1.4',
                    wordWrap: 'break-word',
                    border: '2px dashed #2196f3',
                    opacity: 0.8,
                    fontStyle: 'italic'
                  }}
                >
                  🎤 {tempMessage}
                </div>
              </div>
            )}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginBottom: '10px'
              }}>
                <div style={{
                  padding: '10px 15px',
                  borderRadius: '15px 15px 15px 5px',
                  backgroundColor: '#f0f0f0',
                  color: '#666',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '2px'
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#999',
                      borderRadius: '50%',
                      animation: 'typing 1.4s infinite ease-in-out'
                    }}></div>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#999',
                      borderRadius: '50%',
                      animation: 'typing 1.4s infinite ease-in-out 0.2s'
                    }}></div>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#999',
                      borderRadius: '50%',
                      animation: 'typing 1.4s infinite ease-in-out 0.4s'
                    }}></div>
                  </div>
                  Assistant is typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '15px',
            borderTop: '1px solid #e0e0e0',
            backgroundColor: '#fafafa'
          }}>
            <form onSubmit={handleTextSubmit} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Type your message or use voice..."
                style={{
                  flex: 1,
                  padding: '10px 15px',
                  border: '1px solid #ddd',
                  borderRadius: '25px',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#667eea',
                  border: 'none',
                  color: 'white',
                  padding: '10px 15px',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Send
              </button>
            </form>
            <div style={{
              margin: '5px 0 0 0',
              fontSize: '11px',
              color: '#666',
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Click the mic button to use voice input</span>
              <span style={{
                background: '#e3f2fd',
                color: '#1976d2',
                padding: '2px 6px',
                borderRadius: '10px',
                fontSize: '10px'
              }}>
                Session Mode
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CSS for typing animation */}
      <style jsx>{`
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
