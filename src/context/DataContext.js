import React, { createContext, useContext, useState } from 'react';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  // Mock data for demo purposes
  const [doctors] = useState([
    {
      id: 1,
      name: 'Dr. Sarah Smith',
      specialization: 'Cardiology',
      email: 'doctor@hospital.com',
      phone: '+1-234-567-8901',
      availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
    },
    {
      id: 2,
      name: 'Dr. Michael Brown',
      specialization: 'Neurology',
      email: 'michael@hospital.com',
      phone: '+1-234-567-8903',
      availableSlots: ['08:00', '09:00', '10:00', '13:00', '14:00', '15:00']
    },
    {
      id: 3,
      name: 'Dr. Emily Davis',
      specialization: 'Pediatrics',
      email: 'emily@hospital.com',
      phone: '+1-234-567-8904',
      availableSlots: ['09:00', '11:00', '13:00', '14:00', '16:00', '17:00']
    }
  ]);

  const [patients, setPatients] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'patient@hospital.com',
      phone: '+1-234-567-8900',
      address: '123 Main St, City, State',
      dateOfBirth: '1990-05-15',
      gender: 'Male'
    }
  ]);

  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patientId: 1,
      doctorId: 1,
      date: '2025-08-10',
      time: '10:00',
      status: 'scheduled',
      reason: 'Regular checkup',
      createdAt: new Date().toISOString()
    }
  ]);

  const [medicines, setMedicines] = useState([
    {
      id: 1,
      name: 'Aspirin',
      category: 'Pain Relief',
      description: 'Pain reliever and fever reducer'
    },
    {
      id: 2,
      name: 'Amoxicillin',
      category: 'Antibiotic',
      description: 'Antibiotic for bacterial infections'
    },
    {
      id: 3,
      name: 'Lisinopril',
      category: 'Blood Pressure',
      description: 'ACE inhibitor for high blood pressure'
    }
  ]);

  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1,
      patientId: 1,
      doctorId: 1,
      appointmentId: 1,
      medicines: [
        {
          medicineId: 1,
          medicineName: 'Aspirin',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '7 days',
          instructions: 'Take with food'
        }
      ],
      notes: 'Continue current medication',
      createdAt: new Date().toISOString()
    }
  ]);

  // Appointment management functions
  const addAppointment = (appointmentData) => {
    const newAppointment = {
      id: Date.now(),
      ...appointmentData,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };
    setAppointments(prev => [...prev, newAppointment]);
    return newAppointment;
  };

  const updateAppointment = (appointmentId, updateData) => {
    setAppointments(prev =>
      prev.map(apt =>
        apt.id === appointmentId ? { ...apt, ...updateData } : apt
      )
    );
  };

  const cancelAppointment = (appointmentId) => {
    updateAppointment(appointmentId, { status: 'cancelled' });
  };

  const confirmAppointment = (appointmentId) => {
    updateAppointment(appointmentId, { status: 'confirmed' });
  };

  const completeAppointment = (appointmentId) => {
    updateAppointment(appointmentId, { status: 'completed' });
  };

  // Patient management functions
  const addPatient = (patientData) => {
    const newPatient = {
      id: Date.now(),
      ...patientData
    };
    setPatients(prev => [...prev, newPatient]);
    return newPatient;
  };

  // Prescription management functions
  const addPrescription = (prescriptionData) => {
    const newPrescription = {
      id: Date.now(),
      ...prescriptionData,
      createdAt: new Date().toISOString()
    };
    setPrescriptions(prev => [...prev, newPrescription]);
    return newPrescription;
  };

  // Helper functions
  const getPatientById = (patientId) => {
    return patients.find(patient => patient.id === patientId);
  };

  const getDoctorById = (doctorId) => {
    return doctors.find(doctor => doctor.id === doctorId);
  };

  const getAppointmentsByPatient = (patientId) => {
    return appointments.filter(apt => apt.patientId === patientId);
  };

  const getAppointmentsByDoctor = (doctorId) => {
    return appointments.filter(apt => apt.doctorId === doctorId);
  };

  const getPrescriptionsByPatient = (patientId) => {
    return prescriptions.filter(presc => presc.patientId === patientId);
  };

  const value = {
    doctors,
    patients,
    appointments,
    medicines,
    prescriptions,
    addAppointment,
    updateAppointment,
    cancelAppointment,
    confirmAppointment,
    completeAppointment,
    addPatient,
    addPrescription,
    getPatientById,
    getDoctorById,
    getAppointmentsByPatient,
    getAppointmentsByDoctor,
    getPrescriptionsByPatient
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
