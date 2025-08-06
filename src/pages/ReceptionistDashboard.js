import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const ReceptionistDashboard = () => {
  const { currentUser } = useAuth();
  const { 
    doctors,
    patients,
    appointments,
    addAppointment,
    addPatient,
    updateAppointment,
    getPatientById,
    getDoctorById
  } = useData();

  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [patientForm, setPatientForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: ''
  });

  const [appointmentForm, setAppointmentForm] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    reason: ''
  });

  const todayAppointments = appointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    return apt.date === today;
  });

  const handlePatientSubmit = (e) => {
    e.preventDefault();
    addPatient(patientForm);
    setShowPatientModal(false);
    setPatientForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      gender: ''
    });
    alert('Patient added successfully!');
  };

  const handleAppointmentSubmit = (e) => {
    e.preventDefault();
    addAppointment(appointmentForm);
    setShowAppointmentModal(false);
    setAppointmentForm({
      patientId: '',
      doctorId: '',
      date: '',
      time: '',
      reason: ''
    });
    alert('Appointment scheduled successfully!');
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentForm({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      date: appointment.date,
      time: appointment.time,
      reason: appointment.reason
    });
    setShowEditModal(true);
  };

  const handleUpdateAppointment = (e) => {
    e.preventDefault();
    updateAppointment(selectedAppointment.id, appointmentForm);
    setShowEditModal(false);
    setSelectedAppointment(null);
    setAppointmentForm({
      patientId: '',
      doctorId: '',
      date: '',
      time: '',
      reason: ''
    });
    alert('Appointment updated successfully!');
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getAvailableSlots = (doctorId) => {
    if (!doctorId) return [];
    const doctor = doctors.find(d => d.id === parseInt(doctorId));
    return doctor ? doctor.availableSlots : [];
  };

  return (
    <div className="dashboard">
      <Navbar title="Receptionist Dashboard" />
      
      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome, {currentUser.name}! 🏥</h2>
          <p>Manage appointments and patient registrations.</p>
        </div>

        <div className="stats-grid">
          <Card title="Total Patients" className="stat-card">
            <div className="stat-number">{patients.length}</div>
          </Card>
          <Card title="Total Appointments" className="stat-card">
            <div className="stat-number">{appointments.length}</div>
          </Card>
          <Card title="Today's Appointments" className="stat-card">
            <div className="stat-number">{todayAppointments.length}</div>
          </Card>
          <Card title="Available Doctors" className="stat-card">
            <div className="stat-number">{doctors.length}</div>
          </Card>
        </div>

        <div className="quick-actions-section">
          <Card title="Quick Actions">
            <div className="action-buttons">
              <button 
                onClick={() => setShowPatientModal(true)}
                className="btn btn-primary"
              >
                Add New Patient
              </button>
              <button 
                onClick={() => setShowAppointmentModal(true)}
                className="btn btn-success"
              >
                Schedule Appointment
              </button>
            </div>
          </Card>
        </div>

        <div className="dashboard-grid">
          <Card title="Today's Appointments">
            {todayAppointments.length === 0 ? (
              <p>No appointments scheduled for today</p>
            ) : (
              <div className="appointments-list">
                {todayAppointments.map(appointment => {
                  const patient = getPatientById(appointment.patientId);
                  const doctor = getDoctorById(appointment.doctorId);
                  return (
                    <div key={appointment.id} className="appointment-card">
                      <div className="appointment-info">
                        <h4>{patient?.name}</h4>
                        <p>Doctor: {doctor?.name}</p>
                        <p>🕐 {appointment.time}</p>
                        <p>📝 {appointment.reason}</p>
                        <span className={`status status-${appointment.status}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <div className="appointment-actions">
                        <button 
                          onClick={() => handleEditAppointment(appointment)}
                          className="btn btn-outline btn-sm"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card title="Recent Patients">
            <div className="patients-list">
              {patients.slice(-5).reverse().map(patient => (
                <div key={patient.id} className="patient-card">
                  <h4>{patient.name}</h4>
                  <p>📧 {patient.email}</p>
                  <p>📞 {patient.phone}</p>
                  <p>🎂 {patient.dateOfBirth}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="All Appointments">
            <div className="appointments-table">
              <div className="table-header">
                <span>Patient</span>
                <span>Doctor</span>
                <span>Date</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              {appointments.slice(-10).reverse().map(appointment => {
                const patient = getPatientById(appointment.patientId);
                const doctor = getDoctorById(appointment.doctorId);
                return (
                  <div key={appointment.id} className="table-row">
                    <span>{patient?.name}</span>
                    <span>{doctor?.name}</span>
                    <span>{appointment.date}</span>
                    <span className={`status status-${appointment.status}`}>
                      {appointment.status}
                    </span>
                    <button 
                      onClick={() => handleEditAppointment(appointment)}
                      className="btn btn-outline btn-sm"
                    >
                      Edit
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Add Patient Modal */}
      <Modal 
        isOpen={showPatientModal} 
        onClose={() => setShowPatientModal(false)}
        title="Add New Patient"
      >
        <form onSubmit={handlePatientSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text"
                value={patientForm.name}
                onChange={(e) => setPatientForm({...patientForm, name: e.target.value})}
                required
                placeholder="Enter patient's full name"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email"
                value={patientForm.email}
                onChange={(e) => setPatientForm({...patientForm, email: e.target.value})}
                required
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input 
                type="tel"
                value={patientForm.phone}
                onChange={(e) => setPatientForm({...patientForm, phone: e.target.value})}
                required
                placeholder="Enter phone number"
              />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input 
                type="date"
                value={patientForm.dateOfBirth}
                onChange={(e) => setPatientForm({...patientForm, dateOfBirth: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select 
              value={patientForm.gender}
              onChange={(e) => setPatientForm({...patientForm, gender: e.target.value})}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea 
              value={patientForm.address}
              onChange={(e) => setPatientForm({...patientForm, address: e.target.value})}
              required
              placeholder="Enter address"
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={() => setShowPatientModal(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Patient
            </button>
          </div>
        </form>
      </Modal>

      {/* Schedule Appointment Modal */}
      <Modal 
        isOpen={showAppointmentModal} 
        onClose={() => setShowAppointmentModal(false)}
        title="Schedule Appointment"
      >
        <form onSubmit={handleAppointmentSubmit}>
          <div className="form-group">
            <label>Select Patient</label>
            <select 
              value={appointmentForm.patientId}
              onChange={(e) => setAppointmentForm({...appointmentForm, patientId: e.target.value})}
              required
            >
              <option value="">Choose a patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} - {patient.email}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Doctor</label>
            <select 
              value={appointmentForm.doctorId}
              onChange={(e) => setAppointmentForm({...appointmentForm, doctorId: e.target.value})}
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

          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input 
                type="date"
                value={appointmentForm.date}
                onChange={(e) => setAppointmentForm({...appointmentForm, date: e.target.value})}
                min={getMinDate()}
                required
              />
            </div>
            <div className="form-group">
              <label>Time</label>
              <select 
                value={appointmentForm.time}
                onChange={(e) => setAppointmentForm({...appointmentForm, time: e.target.value})}
                required
                disabled={!appointmentForm.doctorId}
              >
                <option value="">Choose time</option>
                {getAvailableSlots(appointmentForm.doctorId).map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Reason for Visit</label>
            <textarea 
              value={appointmentForm.reason}
              onChange={(e) => setAppointmentForm({...appointmentForm, reason: e.target.value})}
              required
              placeholder="Enter reason for visit"
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={() => setShowAppointmentModal(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Schedule Appointment
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Appointment Modal */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)}
        title="Edit Appointment"
      >
        <form onSubmit={handleUpdateAppointment}>
          <div className="form-group">
            <label>Select Patient</label>
            <select 
              value={appointmentForm.patientId}
              onChange={(e) => setAppointmentForm({...appointmentForm, patientId: e.target.value})}
              required
            >
              <option value="">Choose a patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} - {patient.email}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Doctor</label>
            <select 
              value={appointmentForm.doctorId}
              onChange={(e) => setAppointmentForm({...appointmentForm, doctorId: e.target.value})}
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

          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input 
                type="date"
                value={appointmentForm.date}
                onChange={(e) => setAppointmentForm({...appointmentForm, date: e.target.value})}
                min={getMinDate()}
                required
              />
            </div>
            <div className="form-group">
              <label>Time</label>
              <select 
                value={appointmentForm.time}
                onChange={(e) => setAppointmentForm({...appointmentForm, time: e.target.value})}
                required
                disabled={!appointmentForm.doctorId}
              >
                <option value="">Choose time</option>
                {getAvailableSlots(appointmentForm.doctorId).map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Reason for Visit</label>
            <textarea 
              value={appointmentForm.reason}
              onChange={(e) => setAppointmentForm({...appointmentForm, reason: e.target.value})}
              required
              placeholder="Enter reason for visit"
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Update Appointment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ReceptionistDashboard;
