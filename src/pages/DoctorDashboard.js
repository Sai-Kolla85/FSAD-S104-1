import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const DoctorDashboard = () => {
  const { currentUser } = useAuth();
  const { 
    getAppointmentsByDoctor,
    getPatientById,
    confirmAppointment,
    completeAppointment,
    cancelAppointment,
    addPrescription,
    medicines
  } = useData();

  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
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
    setPrescriptionMedicines([{
      medicineId: '',
      medicineName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }]);
    setPrescriptionNotes('');
    
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
          <Card title="Specialization" className="stat-card">
            <div className="stat-text">{currentUser.specialization}</div>
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
              <button type="button" onClick={() => setShowPrescriptionModal(false)} className="btn btn-outline">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Complete Appointment
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default DoctorDashboard;
