import { Request, Response } from 'express';
import { ReceiveCar, ProcessingCar, Appointment, Client, Car } from '../models';
import { Op } from 'sequelize';

//check if the date is in 8-17
const isWithinWorkingHours = (date: Date): boolean => {
  const hours = date.getHours();
  return hours >= 8 && hours < 17;
};

//check if the duration is multiple of 30
const isMultipleOf30 = (minutes: number): boolean => {
  return minutes % 30 === 0;
};

export const createAppointment = async (req: Request, res: Response): Promise<Response> => {

  const {
    clientId,
    carId,
    date,
    time,
    problemDescription,
    contactMethod,
  } = req.body;
  
  if (!clientId || !carId || !date || !time || !problemDescription || !contactMethod) {
    return res.status(400).json({ message: 'Toate câmpurile sunt obligatorii.' });
  }
  
  const appointmentDateTime = new Date(date);
  
  if (isNaN(appointmentDateTime.getTime())) {
    return res.status(400).json({ message: 'Data și ora programării nu sunt valide.' });
  }

  if (appointmentDateTime < new Date()) {
    return res.status(400).json({ message: 'Programarea trebuie să fie în viitor.' });
  }

  if (!isWithinWorkingHours(appointmentDateTime)) {
    return res.status(400).json({ message: 'Programarea trebuie să fie în intervalul orar 8-17.' });
  }

  if (!isMultipleOf30(time)) {
    return res.status(400).json({ message: 'Durata trebuie să fie multiplă de 30 minute.' });
  }
  
  try {
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Clientul nu a fost găsit.' });
    }

    const car = await Car.findOne({ where: { id: carId, clientId } });
    if (!car) {
      return res.status(404).json({ message: 'Mașina nu a fost găsită sau nu aparține clientului specificat.' });
    }

    const dateTimeDone = new Date(appointmentDateTime);
    dateTimeDone.setMinutes(dateTimeDone.getMinutes() + time);
    
    //verify if there are already appointments on that date
    const overlappingAppointments = await Appointment.findAll({
      where: {
        status: {
          [Op.ne]: 'anulat'
        },
        [Op.or]: [
          //appointments that start during new appointment
          {
            date: {
              [Op.gte]: appointmentDateTime,
              [Op.lt]: dateTimeDone
            }
          },
          //appointments that start before and end after the start of the new appointment
          {
            date: {
              [Op.lt]: appointmentDateTime
            },
          }
        ]
      }
    });

    const filteredOverlappingAppointments = overlappingAppointments.filter(prog => {
      const appointmentEndTime = new Date(prog.date);
      appointmentEndTime.setMinutes(appointmentEndTime.getMinutes() + prog.time);
      return appointmentEndTime > appointmentDateTime;
    });

    if (filteredOverlappingAppointments.length > 0) {
      return res.status(400).json({ message: 'Există deja programări în acest interval orar.' });
    }
    
    const newAppointment = await Appointment.create({
      clientId,
      carId,
      date: appointmentDateTime,
      time,
      problemDescription,
      contactMethod,
      status: 'programat'
    });
    
    return res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Eroare la crearea programării:', error);
    return res.status(500).json({ message: 'Eroare la crearea programării.' });
  }
};

export const getAllAppointments = async (req: Request, res: Response): Promise<Response> => {

  try {
    const appointments = await Appointment.findAll({
      include: [
        { model: Client },
        { model: Car }
      ],
      order: [['date', 'ASC']]
    });

    return res.json(appointments);
  } catch (error) {
    console.error('Eroare la obținerea programărilor:', error);
    return res.status(500).json({ message: 'Eroare la obținerea programărilor.' });
  }
};

export const getAppointmentById = async (req: Request, res: Response): Promise<Response> => {

  const { id } = req.params;

  try {
    const appointment = await Appointment.findByPk(id, {
      include: [
        { model: Client },
        { model: Car }
      ]
    });
    
    if (!appointment) {
      return res.status(404).json({ message: 'Programarea nu a fost găsită.' });
    }
    
    return res.json(appointment);
  } catch (error) {
    console.error(`Eroare la obținerea programării cu id ${id}:`, error);
    return res.status(500).json({ message: `Eroare la obținerea programării cu id ${id}.` });
  }
};

export const getAppointmentsByClientId = async (req: Request, res: Response): Promise<Response> => {

  const clientId = req.params.id;

  try {
    const appointments = await Appointment.findAll({
      where: { clientId },
      include: [{ model: Car }],
      order: [['date', 'ASC']]
    });

    return res.json(appointments);
  } catch (error) {
    console.error(`Eroare la obținerea programărilor pentru clientul cu id ${clientId}:`, error);
    return res.status(500).json({ message: `Eroare la obținerea programărilor pentru clientul cu id ${clientId}.` });
  }
};

export const getAppointmentsByCarId = async (req: Request, res: Response): Promise<Response> => {

  const carId = req.params.carId || req.params.id;
  
  try {
    const appointments = await Appointment.findAll({
      where: { carId },
      include: [{ model: Client }],
      order: [['date', 'ASC']]
    });

    return res.json(appointments);
  } catch (error) {
    console.error(`Eroare la obținerea programărilor pentru mașina cu id ${carId}:`, error);
    return res.status(500).json({ message: `Eroare la obținerea programărilor pentru mașina cu id ${carId}.` });
  }
};

export const updateAppointment = async (req: Request, res: Response): Promise<Response> => {

  const { id } = req.params;
  const {
    date,
    time,
    problemDescription,
    contactMethod,
  } = req.body;
  
  try {
    const appointment = await Appointment.findByPk(id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Programarea nu a fost găsită.' });
    }
    
    if (appointment.status === 'finalizat') {
      return res.status(400).json({ message: 'Nu se poate modifica o programare finalizată.' });
    }
    
    let updatedDate = appointment.date;
    
    if (date) {
      updatedDate = new Date(date);
      
      if (isNaN(updatedDate.getTime())) {
        return res.status(400).json({ message: 'Data și ora programării nu sunt valide.' });
      }
      
      if (updatedDate < new Date()) {
        return res.status(400).json({ message: 'Programarea trebuie să fie în viitor.' });
      }
      
      if (!isWithinWorkingHours(updatedDate)) {
        return res.status(400).json({ message: 'Programarea trebuie să fie în intervalul orar 8-17.' });
      }
    }
    
    let updatedTime = appointment.time;
    
    if (time) {
      if (!isMultipleOf30(time)) {
        return res.status(400).json({ message: 'Durata trebuie să fie multiplă de 30 minute.' });
      }
      updatedTime = time;
    }
    
    const dateTimeFinish = new Date(updatedDate);
    dateTimeFinish.setMinutes(dateTimeFinish.getMinutes() + updatedTime);
    
    //verify if there are overlapping appointments
    if (date || time) {
      //get all active appointments(non-canceled)
      const activeAppointments = await Appointment.findAll({
        where: {
          id: { [Op.ne]: id }, //exclude current appointment
          status: {
            [Op.ne]: 'anulat'
          }
        }
      });
      
      const overlappingAppointments = activeAppointments.filter(appointment => {
        //calculate the time to finish the current appointment
        const appointmentEndTime = new Date(appointment.date);
        appointmentEndTime.setMinutes(appointmentEndTime.getMinutes() + appointment.time);
        
        return (
          (updatedDate >= appointment.date && updatedDate < appointmentEndTime) ||
          (dateTimeFinish > appointment.date && dateTimeFinish <= appointmentEndTime) ||
          (updatedDate <= appointment.date && dateTimeFinish >= appointmentEndTime)
        );
      });
      
      if (overlappingAppointments.length > 0) {
        return res.status(400).json({ message: 'Există deja programări în acest interval orar.' });
      }
    }
    
    await appointment.update({
      date: updatedDate,
      time: updatedTime,
      problemDescription: problemDescription || appointment.problemDescription,
      metodaContact: contactMethod || appointment.contactMethod,
    });
    
    return res.json(appointment);
  } catch (error) {
    console.error(`Eroare la actualizarea programării cu id ${id}:`, error);
    return res.status(500).json({ message: `Eroare la actualizarea programării cu id ${id}.` });
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response): Promise<Response> => {

  const { id } = req.params;
  const { status } = req.body;
  
  if (!status || !['programat', 'in lucru', 'finalizat', 'anulat'].includes(status)) {
    return res.status(400).json({ message: 'Status invalid. Valorile acceptate sunt: programat, in lucru, finalizat, anulat.' });
  }
  
  try {
    const appointment = await Appointment.findByPk(id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Programarea nu a fost găsită.' });
    }
    
    if (['finalizat', 'anulat'].includes(appointment.status)) {
      return res.status(400).json({ message: `Nu se poate modifica statusul unei programări ${appointment.status}.` });
    }
    
    await appointment.update({ status });
    
    return res.json({
      message: `Statusul programării a fost actualizat la: ${status}.`,
      appointment
    });
  } catch (error) {
    console.error(`Eroare la actualizarea statusului programării cu id ${id}:`, error);
    return res.status(500).json({ message: `Eroare la actualizarea statusului programării cu id ${id}.` });
  }
};

export const verifyDisponibility = async (req: Request, res: Response): Promise<Response> => {
  try {

    return res.json(true); //always true for testing
  } catch (error: any) {
    console.error('Eroare la verificarea disponibilității:', error);
    return res.status(500).json({ message: 'Eroare la verificarea disponibilității.' });
  }
};

export const getAppointmentIstoric = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  
  try {
    //find the ReceiveCar and ProcessingCar records in parallel
    const [receive, processing] = await Promise.all([
      ReceiveCar.findOne({ where: { appointmentId: id } }),
      ProcessingCar.findOne({ where: { appointmentId: id } })
    ]);
    
    if (!receive && !processing) {
      return res.json(null);
    }

    const istoric = {
      id: receive ? receive.id : (processing ? processing.id : null),
      appointmentId: parseInt(id),
      receiveCar: receive,
      processingCar: processing,
      status: processing ? 'finalizat' : 'in-progres',
      createdAt: receive ? receive.createdAt : (processing ? processing.createdAt : null),
      updatedAt: receive ? receive.updatedAt : (processing ? processing.updatedAt : null)
    };
    
    return res.json(istoric);
  } catch (error) {
    console.error(`Eroare la obținerea istoricului pentru programarea cu id ${id}:`, error);
    return res.status(500).json({ message: `Eroare la obținerea istoricului pentru programarea cu id ${id}.` });
  }
};

export const deleteAppointment = async (req: Request, res: Response): Promise<Response> => {

  const { id } = req.params;
  
  try {
    const appointment = await Appointment.findByPk(id);
    
    if (!appointment) {
      return res.status(404).json({ message: `Programarea cu ID ${id} nu a fost găsită.` });
    }
    
    const receive = await ReceiveCar.findOne({ where: { appointmentId: id } });
    const processing = await ProcessingCar.findOne({ where: { appointmentId: id } });
    
    if (receive || processing) {
      return res.status(400).json({ 
        message: 'Nu se poate șterge programarea deoarece are înregistrări în istoricul de service.' 
      });
    }
    
    await appointment.destroy();
    
    return res.status(200).json({ 
      message: `Programarea cu ID ${id} a fost ștearsă cu succes.`,
      id
    });
  } catch (error) {
    console.error(`Eroare la ștergerea programării cu id ${id}:`, error);
    return res.status(500).json({ message: `Eroare la ștergerea programării cu id ${id}.` });
  }
};