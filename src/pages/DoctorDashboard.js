import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const DoctorDashboard = () => {
  const { currentUser } = useAuth();
  const { 
    appointments,
    prescriptions,
    getAppointmentsByDoctor,
    getPatientById,
    confirmAppointment,
    completeAppointment,
    cancelAppointment,
    addPrescription,
    medicines
  } = useData();

  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showPatientRecordsModal, setShowPatientRecordsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [prescriptionMedicines, setPrescriptionMedicines] = useState([{
    medicineId: '',
    medicineName: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  }]);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');

  const doctorAppointments = getAppointmentsByDoctor(currentUser.id);
  const todayAppointments = doctorAppointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    return apt.date === today;
  });

  const pendingAppointments = doctorAppointments.filter(apt => 
    apt.status === 'scheduled'
  );

  const confirmedAppointments = doctorAppointments.filter(apt => 
    apt.status === 'confirmed'
  );

  const completedAppointments = doctorAppointments.filter(apt => 
    apt.status === 'completed'
  );

  const handleConfirmAppointment = (appointmentId) => {
    confirmAppointment(appointmentId);
    alert('Appointment confirmed!');
  };

  const handleCancelAppointment = (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      cancelAppointment(appointmentId);
      alert('Appointment cancelled!');
    }
  };

  const handleCompleteAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPrescriptionModal(true);
  };

  const handleViewPatientRecords = (appointment) => {
    const patient = getPatientById(appointment.patientId);
    setSelectedPatient(patient);
    setShowPatientRecordsModal(true);
  };

  const handleViewSchedule = () => {
    setShowScheduleModal(true);
  };

  const resetPrescriptionForm = () => {
    setPrescriptionMedicines([{
      medicineId: '',
      medicineName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }]);
    setPrescriptionNotes('');
  };

  const addMedicineField = () => {
    setPrescriptionMedicines([...prescriptionMedicines, {
      medicineId: '',
      medicineName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }]);
  };

  // Helper functions for patient records
  const getAppointmentsByPatient = (patientId) => {
    return appointments.filter(apt => apt.patientId === patientId);
  };

  const getPrescriptionsByPatient = (patientId) => {
    return prescriptions.filter(presc => presc.patientId === patientId);
  };

  const removeMedicineField = (index) => {
    if (prescriptionMedicines.length > 1) {
      setPrescriptionMedicines(prescriptionMedicines.filter((_, i) => i !== index));
    }
  };

  const updateMedicine = (index, field, value) => {
    const updated = prescriptionMedicines.map((med, i) => {
      if (i === index) {
        const updatedMed = { ...med, [field]: value };
        if (field === 'medicineId' && value) {
          const selectedMedicine = medicines.find(m => m.id === parseInt(value));
          updatedMed.medicineName = selectedMedicine?.name || '';
        }
        return updatedMed;
      }
      return med;
    });
    setPrescriptionMedicines(updated);
  };

  const handleSubmitPrescription = (e) => {
    e.preventDefault();
    
    const prescriptionData = {
      patientId: selectedAppointment.patientId,
      doctorId: currentUser.id,
      appointmentId: selectedAppointment.id,
      medicines: prescriptionMedicines.filter(med => med.medicineId),
      notes: prescriptionNotes
    };

    addPrescription(prescriptionData);
    completeAppointment(selectedAppointment.id);
    
    setShowPrescriptionModal(false);
    setSelectedAppointment(null);
    resetPrescriptionForm();
    
    alert('Prescription added and appointment completed!');
  };

  return (
    <div className="dashboard">
      <Navbar title="Doctor Dashboard" />
      
      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome, {currentUser.name}! 👨‍⚕️</h2>
          <p>Manage your appointments and patient care.</p>
        </div>

        <div className="stats-grid">
          <Card title="Total Appointments" className="stat-card">
            <div className="stat-number">{doctorAppointments.length}</div>
          </Card>
          <Card title="Today's Appointments" className="stat-card">
            <div className="stat-number">{todayAppointments.length}</div>
          </Card>
          <Card title="Pending Confirmations" className="stat-card">
            <div className="stat-number">{pendingAppointments.length}</div>
          </Card>
          <Card title="Completed" className="stat-card">
            <div className="stat-number">{completedAppointments.length}</div>
          </Card>
        </div>

        <div className="quick-actions-section">
          <Card title="Quick Actions">
            <div className="action-buttons">
              <button 
                onClick={handleViewSchedule}
                className="btn btn-primary"
              >
                📅 View Full Schedule
              </button>
              <button 
                onClick={() => setShowPatientRecordsModal(true)}
                className="btn btn-outline"
              >
                👥 Patient Records
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
                  return (
                    <div key={appointment.id} className="appointment-card">
                      <div className="appointment-info">
                        <h4>{patient?.name}</h4>
                        <p>📞 {patient?.phone}</p>
                        <p>🕐 {appointment.time}</p>
                        <p>📝 {appointment.reason}</p>
                        <span className={`status status-${appointment.status}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <div className="appointment-actions">
                        {appointment.status === 'scheduled' && (
                          <button 
                            onClick={() => handleConfirmAppointment(appointment.id)}
                            className="btn btn-success btn-sm"
                          >
                            Confirm
                          </button>
                        )}
                        {appointment.status === 'confirmed' && (
                          <button 
                            onClick={() => handleCompleteAppointment(appointment)}
                            className="btn btn-primary btn-sm"
                          >
                            Complete & Prescribe
                          </button>
                        )}
                        <button 
                          onClick={() => handleViewPatientRecords(appointment)}
                          className="btn btn-outline btn-sm"
                        >
                          View Patient
                        </button>
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

          <Card title="Pending Appointments">
            {pendingAppointments.length === 0 ? (
              <p>No pending appointments</p>
            ) : (
              <div className="appointments-list">
                {pendingAppointments.slice(0, 5).map(appointment => {
                  const patient = getPatientById(appointment.patientId);
                  return (
                    <div key={appointment.id} className="appointment-card">
                      <div className="appointment-info">
                        <h4>{patient?.name}</h4>
                        <p>📅 {appointment.date} at {appointment.time}</p>
                        <p>📝 {appointment.reason}</p>
                        <span className={`status status-${appointment.status}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <div className="appointment-actions">
                        <button 
                          onClick={() => handleConfirmAppointment(appointment.id)}
                          className="btn btn-success btn-sm"
                        >
                          Confirm
                        </button>
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

          <Card title="Quick Actions">
            <div className="quick-actions">
              <button className="btn btn-outline">
                View All Appointments
              </button>
              <button className="btn btn-outline">
                Patient Records
              </button>
              <button className="btn btn-outline">
                Schedule Management
              </button>
            </div>
          </Card>
        </div>
      </div>

      <Modal 
        isOpen={showPrescriptionModal} 
        onClose={() => setShowPrescriptionModal(false)}
        title="Add Prescription"
      >
        {selectedAppointment && (
          <form onSubmit={handleSubmitPrescription}>
            <div className="patient-info">
              <h4>Patient: {getPatientById(selectedAppointment.patientId)?.name}</h4>
              <p>Appointment: {selectedAppointment.date} at {selectedAppointment.time}</p>
              <p>Reason: {selectedAppointment.reason}</p>
            </div>

            <div className="medicines-section">
              <h4>Medicines</h4>
              {prescriptionMedicines.map((medicine, index) => (
                <div key={index} className="medicine-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Medicine</label>
                      <select 
                        value={medicine.medicineId}
                        onChange={(e) => updateMedicine(index, 'medicineId', e.target.value)}
                        required
                      >
                        <option value="">Select Medicine</option>
                        {medicines.map(med => (
                          <option key={med.id} value={med.id}>
                            {med.name} ({med.category})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Dosage</label>
                      <input 
                        type="text"
                        value={medicine.dosage}
                        onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                        placeholder="e.g., 500mg"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Frequency</label>
                      <select 
                        value={medicine.frequency}
                        onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                        required
                      >
                        <option value="">Select Frequency</option>
                        <option value="Once daily">Once daily</option>
                        <option value="Twice daily">Twice daily</option>
                        <option value="Three times daily">Three times daily</option>
                        <option value="Four times daily">Four times daily</option>
                        <option value="As needed">As needed</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Duration</label>
                      <input 
                        type="text"
                        value={medicine.duration}
                        onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                        placeholder="e.g., 7 days"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Instructions</label>
                    <input 
                      type="text"
                      value={medicine.instructions}
                      onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                      placeholder="e.g., Take with food"
                    />
                  </div>
                  
                  {prescriptionMedicines.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => removeMedicineField(index)}
                      className="btn btn-danger btn-sm"
                    >
                      Remove Medicine
                    </button>
                  )}
                </div>
              ))}
              
              <button 
                type="button"
                onClick={addMedicineField}
                className="btn btn-outline"
              >
                Add Another Medicine
              </button>
            </div>

            <div className="form-group">
              <label>Additional Notes</label>
              <textarea 
                value={prescriptionNotes}
                onChange={(e) => setPrescriptionNotes(e.target.value)}
                placeholder="Additional instructions or notes"
                rows="3"
              />
            </div>

            <div className="modal-actions">
              <button type="button" onClick={() => {
                setShowPrescriptionModal(false);
                resetPrescriptionForm();
              }} className="btn btn-outline">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Complete Appointment
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Patient Records Modal */}
      <Modal 
        isOpen={showPatientRecordsModal} 
        onClose={() => setShowPatientRecordsModal(false)}
        title="Patient Records"
      >
        {selectedPatient ? (
          <div className="patient-records">
            <div className="patient-info">
              <h4>Patient Information</h4>
              <p><strong>Name:</strong> {selectedPatient.name}</p>
              <p><strong>Email:</strong> {selectedPatient.email}</p>
              <p><strong>Phone:</strong> {selectedPatient.phone}</p>
              <p><strong>Date of Birth:</strong> {selectedPatient.dateOfBirth}</p>
              <p><strong>Gender:</strong> {selectedPatient.gender}</p>
              <p><strong>Address:</strong> {selectedPatient.address}</p>
            </div>

            <div className="appointment-history">
              <h4>Appointment History</h4>
              {getAppointmentsByPatient(selectedPatient.id).map(apt => (
                <div key={apt.id} className="appointment-record">
                  <p><strong>Date:</strong> {apt.date} at {apt.time}</p>
                  <p><strong>Status:</strong> {apt.status}</p>
                  <p><strong>Reason:</strong> {apt.reason}</p>
                </div>
              ))}
            </div>

            <div className="prescription-history">
              <h4>Prescription History</h4>
              {getPrescriptionsByPatient(selectedPatient.id).map(presc => (
                <div key={presc.id} className="prescription-record">
                  <p><strong>Date:</strong> {new Date(presc.createdAt).toLocaleDateString()}</p>
                  <p><strong>Medicines:</strong> {presc.medicines.length} prescribed</p>
                  {presc.notes && <p><strong>Notes:</strong> {presc.notes}</p>}
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowPatientRecordsModal(false)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="all-patients">
            <h4>All Patients</h4>
            <div className="patients-list">
              {/* This would show all patients - for now showing message */}
              <p>Select a patient from an appointment to view detailed records.</p>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowPatientRecordsModal(false)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Schedule Modal */}
      <Modal 
        isOpen={showScheduleModal} 
        onClose={() => setShowScheduleModal(false)}
        title="Full Schedule"
      >
        <div className="schedule-view">
          <div className="schedule-filters">
            <h4>All Appointments for {currentUser.name}</h4>
            <p>Specialization: {currentUser.specialization}</p>
          </div>

          <div className="appointments-by-status">
            <div className="status-section">
              <h5>Pending Appointments ({pendingAppointments.length})</h5>
              {pendingAppointments.map(appointment => {
                const patient = getPatientById(appointment.patientId);
                return (
                  <div key={appointment.id} className="mini-appointment-card">
                    <p><strong>{patient?.name}</strong> - {appointment.date} at {appointment.time}</p>
                    <p>{appointment.reason}</p>
                  </div>
                );
              })}
            </div>

            <div className="status-section">
              <h5>Confirmed Appointments ({confirmedAppointments.length})</h5>
              {confirmedAppointments.map(appointment => {
                const patient = getPatientById(appointment.patientId);
                return (
                  <div key={appointment.id} className="mini-appointment-card">
                    <p><strong>{patient?.name}</strong> - {appointment.date} at {appointment.time}</p>
                    <p>{appointment.reason}</p>
                  </div>
                );
              })}
            </div>

            <div className="status-section">
              <h5>Completed Appointments ({completedAppointments.length})</h5>
              {completedAppointments.map(appointment => {
                const patient = getPatientById(appointment.patientId);
                return (
                  <div key={appointment.id} className="mini-appointment-card">
                    <p><strong>{patient?.name}</strong> - {appointment.date} at {appointment.time}</p>
                    <p>{appointment.reason}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="modal-actions">
            <button onClick={() => setShowScheduleModal(false)} className="btn btn-primary">
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DoctorDashboard;
