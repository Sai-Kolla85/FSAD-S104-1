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
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showAppointmentHistoryModal, setShowAppointmentHistoryModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const patientAppointments = getAppointmentsByPatient(currentUser.id);
  const patientPrescriptions = getPrescriptionsByPatient(currentUser.id);

  const upcomingAppointments = patientAppointments.filter(apt => 
    apt.status === 'scheduled' || apt.status === 'confirmed'
  );

  const completedAppointments = patientAppointments.filter(apt => 
    apt.status === 'completed'
  );

  const recentPrescriptions = patientPrescriptions.slice(0, 3);

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
    resetBookingForm();
    alert('Appointment booked successfully!');
  };

  const handleCancelAppointment = (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      cancelAppointment(appointmentId);
      alert('Appointment cancelled successfully!');
    }
  };

  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionModal(true);
  };

  const handleViewAppointmentHistory = () => {
    setShowAppointmentHistoryModal(true);
  };

  const resetBookingForm = () => {
    setSelectedDoctor('');
    setSelectedDate('');
    setSelectedTime('');
    setReason('');
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
          <Card title="Completed Appointments" className="stat-card">
            <div className="stat-number">{completedAppointments.length}</div>
          </Card>
          <Card title="Total Prescriptions" className="stat-card">
            <div className="stat-number">{patientPrescriptions.length}</div>
          </Card>
        </div>

        <div className="quick-actions-section">
          <Card title="Quick Actions">
            <div className="action-buttons">
              <button 
                onClick={() => setShowBookingModal(true)}
                className="btn btn-primary"
              >
                📅 Book New Appointment
              </button>
              <button 
                onClick={handleViewAppointmentHistory}
                className="btn btn-outline"
              >
                📋 View Appointment History
              </button>
            </div>
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
                {recentPrescriptions.map(prescription => {
                  const doctor = getDoctorById(prescription.doctorId);
                  return (
                    <div key={prescription.id} className="prescription-card">
                      <div className="prescription-header">
                        <h4>Prescribed by {doctor?.name}</h4>
                        <button 
                          onClick={() => handleViewPrescription(prescription)}
                          className="btn btn-outline btn-sm"
                        >
                          View Details
                        </button>
                      </div>
                      <div className="medicines-summary">
                        <p><strong>Medicines:</strong> {prescription.medicines.length} prescribed</p>
                        <p className="prescription-date">
                          Date: {new Date(prescription.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {patientPrescriptions.length > 3 && (
                  <button className="btn btn-outline btn-sm">
                    View All Prescriptions ({patientPrescriptions.length})
                  </button>
                )}
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
            <button type="button" onClick={() => {
              setShowBookingModal(false);
              resetBookingForm();
            }} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Book Appointment
            </button>
          </div>
        </form>
      </Modal>

      {/* Prescription Details Modal */}
      <Modal 
        isOpen={showPrescriptionModal} 
        onClose={() => setShowPrescriptionModal(false)}
        title="Prescription Details"
      >
        {selectedPrescription && (
          <div className="prescription-details">
            <div className="patient-info">
              <h4>Prescribed by {getDoctorById(selectedPrescription.doctorId)?.name}</h4>
              <p>Date: {new Date(selectedPrescription.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="medicines-section">
              <h4>Prescribed Medicines</h4>
              {selectedPrescription.medicines.map((med, index) => (
                <div key={index} className="medicine-item">
                  <strong>{med.medicineName}</strong>
                  <p><strong>Dosage:</strong> {med.dosage}</p>
                  <p><strong>Frequency:</strong> {med.frequency}</p>
                  <p><strong>Duration:</strong> {med.duration}</p>
                  <p><strong>Instructions:</strong> {med.instructions || 'None'}</p>
                </div>
              ))}
            </div>

            {selectedPrescription.notes && (
              <div className="prescription-notes">
                <h4>Additional Notes</h4>
                <p>{selectedPrescription.notes}</p>
              </div>
            )}

            <div className="modal-actions">
              <button onClick={() => setShowPrescriptionModal(false)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Appointment History Modal */}
      <Modal 
        isOpen={showAppointmentHistoryModal} 
        onClose={() => setShowAppointmentHistoryModal(false)}
        title="Appointment History"
      >
        <div className="appointment-history">
          {patientAppointments.length === 0 ? (
            <p>No appointment history available</p>
          ) : (
            <div className="appointments-list">
              {patientAppointments.map(appointment => {
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
                    <div className="appointment-meta">
                      <p className="appointment-date">
                        Booked: {new Date(appointment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="modal-actions">
            <button onClick={() => setShowAppointmentHistoryModal(false)} className="btn btn-primary">
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PatientDashboard;
