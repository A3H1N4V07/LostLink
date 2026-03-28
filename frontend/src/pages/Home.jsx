import { useNavigate } from "react-router-dom";
import homeImg1 from "../assets/home1.webp";
import homeImg2 from "../assets/home3.avif";
import homeImg3 from "../assets/home2.jpg";

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes popIn {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
            100% { transform: translateY(0px); }
          }
          .animate-fade-up {
            animation: fadeInUp 0.8s ease-out forwards;
            opacity: 0;
          }
          .animate-delay-1 { animation-delay: 0.2s; }
          .animate-delay-2 { animation-delay: 0.4s; }
          .animate-delay-3 { animation-delay: 0.6s; }
          .animate-delay-4 { animation-delay: 0.8s; }
          
          .floating-img-1 { animation: popIn 0.6s ease-out 0.6s forwards, float 4s ease-in-out infinite 1.2s; opacity: 0; }
          .floating-img-2 { animation: popIn 0.6s ease-out 0.8s forwards, float 5s ease-in-out infinite 1.4s; opacity: 0; }
          .floating-img-3 { animation: popIn 0.6s ease-out 1.0s forwards, float 4.5s ease-in-out infinite 1.6s; opacity: 0; }
        `}
      </style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #fef0e5 0%, #ebfbe0 100%)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        }}
      >
        <div className="container flex-grow-1 d-flex flex-column justify-content-center pt-5 pb-5">
          <div className="row align-items-center">
            <div className="col-md-6 text-start px-md-5 animate-fade-up">
              <h1 className="fw-bolder mb-3" style={{ fontSize: "4.5rem", lineHeight: "1.1", color: "#1a1a1a" }}>
                Find &<br />
                Recover<br />
                <span style={{ color: "#2d7a3e" }}>With</span> <span style={{ color: "#4a1c1c" }}>Ease</span>
              </h1>
              <p className="mb-5 mt-4 fw-medium animate-fade-up animate-delay-1" style={{ fontSize: "1.1rem", color: "#444" }}>
                Experience effortless recovery with our dedicated lost and found service.
              </p>
            </div>

            <div className="col-md-6 d-flex flex-column align-items-center position-relative">
              
              <div
                className="shadow-sm d-flex justify-content-between align-items-center mb-3 animate-fade-up animate-delay-2"
                style={{
                  backgroundColor: "#e35d5d",
                  color: "#fff",
                  borderRadius: "8px",
                  padding: "16px 24px",
                  width: "280px",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 8px 15px rgba(227, 93, 93, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 .125rem .25rem rgba(0,0,0,.075)";
                }}
                onClick={() => navigate("/upload?type=lost")}
              >
                <span style={{ fontSize: "1.3rem", fontWeight: "600" }}>Lost</span>
                <span style={{ fontSize: "1.5rem" }}>📦</span>
              </div>

              <div
                className="shadow-sm d-flex justify-content-between align-items-center animate-fade-up animate-delay-3"
                style={{
                  backgroundColor: "#36a956",
                  color: "#fff",
                  borderRadius: "8px",
                  padding: "16px 24px",
                  width: "280px",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 8px 15px rgba(54, 169, 86, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 .125rem .25rem rgba(0,0,0,.075)";
                }}
                onClick={() => navigate("/upload?type=found")}
              >
                <span style={{ fontSize: "1.3rem", fontWeight: "600" }}>Found</span>
                <span style={{ fontSize: "1.5rem", backgroundColor: "#fff", borderRadius: "50%", padding: "2px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>🔍</span>
              </div>

              <div className="position-relative mt-5" style={{ height: "220px", width: "100%", maxWidth: "400px" }}>
                <img 
                  src={homeImg1}
                  alt="Working" 
                  className="floating-img-1"
                  style={{ width: "140px", height: "120px", objectFit: "cover", borderRadius: "8px", position: "absolute", left: "10%", top: "0", zIndex: 3, border: "2px solid #fff", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }} 
                />
                <img 
                  src={homeImg2}
                  alt="Forest" 
                  className="floating-img-2"
                  style={{ width: "120px", height: "140px", objectFit: "cover", borderRadius: "8px", position: "absolute", left: "35%", top: "20px", zIndex: 2, border: "2px solid #fff", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }} 
                />
                <img 
                  src={homeImg3} 
                  alt="Compass" 
                  className="floating-img-3"
                  style={{ width: "130px", height: "130px", objectFit: "cover", borderRadius: "8px", position: "absolute", left: "60%", top: "50px", zIndex: 1, border: "2px solid #fff", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }} 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="animate-fade-up animate-delay-4" style={{ backgroundColor: "#fcfcfa", padding: "40px 0 20px 0", borderTop: "1px solid #eaeaea", marginTop: "auto" }}>
          <div className="container">
            <div className="row text-start" style={{ fontSize: "0.85rem", color: "#333" }}>
              <div className="col-md-3 mb-3">
                 <div className="d-flex align-items-center mb-3">
                   <span style={{ fontSize: "20px", marginRight: "8px" }}>📦</span>
                   <div className="fw-bold lh-1">
                     LostLink<br/>
                     <span style={{fontSize: "8px", color: "#888", fontWeight: "normal"}}>Recover. Connect. Restore.</span>
                   </div>
                 </div>
              </div>
              <div className="col-md-2 mb-3">
                <h6 className="fw-bold mb-3">Site</h6>
                <div className="text-muted mb-1" style={{cursor: "pointer"}}>Lost</div>
                <div className="text-muted mb-1" style={{cursor: "pointer"}}>Report Lost</div>
                <div className="text-muted mb-1" style={{cursor: "pointer"}}>Found</div>
                <div className="text-muted mb-1" style={{cursor: "pointer"}}>Report Found</div>
              </div>
              <div className="col-md-2 mb-3">
                <h6 className="fw-bold mb-3">Help</h6>
                <div className="text-muted mb-1" style={{cursor: "pointer"}}>Customer Support</div>
                <div className="text-muted mb-1" style={{cursor: "pointer"}}>Terms & Conditions</div>
                <div className="text-muted mb-1" style={{cursor: "pointer"}}>Privacy Policy</div>
              </div>
              <div className="col-md-2 mb-3">
                <h6 className="fw-bold mb-3">Links</h6>
                <div className="text-muted mb-1" style={{cursor: "pointer"}}>LinkedIn</div>
                <div className="text-muted mb-1" style={{cursor: "pointer"}}>Facebook</div>
                <div className="text-muted mb-1" style={{cursor: "pointer"}}>YouTube</div>
                <div className="text-muted mb-1" style={{cursor: "pointer"}}>About Us</div>
              </div>
              <div className="col-md-3 mb-3">
                <h6 className="fw-bold mb-3">Contact</h6>
                <div className="text-muted mb-1">Tel : +94 716520690</div>
                <div className="text-muted mb-3">Email : info@example.com</div>
                <div className="d-flex gap-2">
                  <span className="bg-light border rounded-circle d-flex align-items-center justify-content-center" style={{width:"30px", height:"30px", cursor: "pointer", transition: "0.2s"}} onMouseEnter={(e)=>e.target.style.backgroundColor="#e2e8f0"} onMouseLeave={(e)=>e.target.style.backgroundColor="#f8f9fa"}>X</span>
                  <span className="bg-light border rounded-circle d-flex align-items-center justify-content-center" style={{width:"30px", height:"30px", cursor: "pointer", transition: "0.2s"}} onMouseEnter={(e)=>e.target.style.backgroundColor="#e2e8f0"} onMouseLeave={(e)=>e.target.style.backgroundColor="#f8f9fa"}>f</span>
                  <span className="bg-light border rounded-circle d-flex align-items-center justify-content-center" style={{width:"30px", height:"30px", cursor: "pointer", transition: "0.2s"}} onMouseEnter={(e)=>e.target.style.backgroundColor="#e2e8f0"} onMouseLeave={(e)=>e.target.style.backgroundColor="#f8f9fa"}>in</span>
                </div>
              </div>
            </div>
            <div className="text-center text-muted mt-4" style={{ fontSize: "0.75rem" }}>
              © Copyright 2024 Lost and Found<br/>
              All Right Reserved
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;