import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const PatientDashboard = () => {
  const { currentUser } = useAuth();
  const { 
    doctors, 
    addAppointment, 
    getAppointmentsByPatient, 
    getPrescriptionsByPatient,
    getDoctorById,
    cancelAppointment
  } = useData();

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');

  const patientAppointments = getAppointmentsByPatient(currentUser.id);
  const patientPrescriptions = getPrescriptionsByPatient(currentUser.id);

  const upcomingAppointments = patientAppointments.filter(apt => 
    apt.status === 'scheduled' || apt.status === 'confirmed'
  );

  const handleBookAppointment = (e) => {
    e.preventDefault();
    
    const appointmentData = {
      patientId: currentUser.id,
      doctorId: parseInt(selectedDoctor),
      date: selectedDate,
      time: selectedTime,
      reason
    };

    addAppointment(appointmentData);
    setShowBookingModal(false);
    
    // Reset form
    setSelectedDoctor('');
    setSelectedDate('');
    setSelectedTime('');
    setReason('');
    
    alert('Appointment booked successfully!');
  };

  const handleCancelAppointment = (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      cancelAppointment(appointmentId);
      alert('Appointment cancelled successfully!');
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getAvailableSlots = () => {
    if (!selectedDoctor) return [];
    const doctor = doctors.find(d => d.id === parseInt(selectedDoctor));
    return doctor ? doctor.availableSlots : [];
  };

  return (
    <div className="dashboard">
      <Navbar title="Patient Dashboard" />
      
      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome back, {currentUser.name}! 👋</h2>
          <p>Manage your appointments and track your health journey.</p>
        </div>

        <div className="stats-grid">
          <Card title="Total Appointments" className="stat-card">
            <div className="stat-number">{patientAppointments.length}</div>
          </Card>
          <Card title="Upcoming Appointments" className="stat-card">
            <div className="stat-number">{upcomingAppointments.length}</div>
          </Card>
          <Card title="Prescriptions" className="stat-card">
            <div className="stat-number">{patientPrescriptions.length}</div>
          </Card>
          <Card title="Quick Actions" className="stat-card">
            <button 
              onClick={() => setShowBookingModal(true)}
              className="btn btn-primary"
            >
              Book Appointment
            </button>
          </Card>
        </div>

        <div className="dashboard-grid">
          <Card title="Upcoming Appointments">
            {upcomingAppointments.length === 0 ? (
              <p>No upcoming appointments</p>
            ) : (
              <div className="appointments-list">
                {upcomingAppointments.map(appointment => {
                  const doctor = getDoctorById(appointment.doctorId);
                  return (
                    <div key={appointment.id} className="appointment-card">
                      <div className="appointment-info">
                        <h4>{doctor?.name}</h4>
                        <p>{doctor?.specialization}</p>
                        <p>📅 {appointment.date} at {appointment.time}</p>
                        <p>📝 {appointment.reason}</p>
                        <span className={`status status-${appointment.status}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <div className="appointment-actions">
                        <button 
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="btn btn-danger btn-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card title="Recent Prescriptions">
            {patientPrescriptions.length === 0 ? (
              <p>No prescriptions available</p>
            ) : (
              <div className="prescriptions-list">
                {patientPrescriptions.slice(0, 3).map(prescription => {
                  const doctor = getDoctorById(prescription.doctorId);
                  return (
                    <div key={prescription.id} className="prescription-card">
                      <h4>Prescribed by {doctor?.name}</h4>
                      <div className="medicines">
                        {prescription.medicines.map((med, index) => (
                          <div key={index} className="medicine-item">
                            <strong>{med.medicineName}</strong>
                            <p>{med.dosage} - {med.frequency}</p>
                            <p>Duration: {med.duration}</p>
                            <p>Instructions: {med.instructions}</p>
                          </div>
                        ))}
                      </div>
                      <p className="prescription-date">
                        Date: {new Date(prescription.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card title="Available Doctors">
            <div className="doctors-grid">
              {doctors.map(doctor => (
                <div key={doctor.id} className="doctor-card">
                  <h4>{doctor.name}</h4>
                  <p>{doctor.specialization}</p>
                  <p>📞 {doctor.phone}</p>
                  <button 
                    onClick={() => {
                      setSelectedDoctor(doctor.id.toString());
                      setShowBookingModal(true);
                    }}
                    className="btn btn-outline btn-sm"
                  >
                    Book Appointment
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Modal 
        isOpen={showBookingModal} 
        onClose={() => setShowBookingModal(false)}
        title="Book Appointment"
      >
        <form onSubmit={handleBookAppointment}>
          <div className="form-group">
            <label>Select Doctor</label>
            <select 
              value={selectedDoctor} 
              onChange={(e) => setSelectedDoctor(e.target.value)}
              required
            >
              <option value="">Choose a doctor</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Date</label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getMinDate()}
              required
            />
          </div>

          <div className="form-group">
            <label>Select Time</label>
            <select 
              value={selectedTime} 
              onChange={(e) => setSelectedTime(e.target.value)}
              required
              disabled={!selectedDoctor}
            >
              <option value="">Choose a time</option>
              {getAvailableSlots().map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Reason for Visit</label>
            <textarea 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the reason for your visit"
              rows="3"
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={() => setShowBookingModal(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Book Appointment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PatientDashboard;
