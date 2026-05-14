module.export = parseDateTime = (fecha, hora) => {
    const [h, m] = hora.split(':').map(Number);
    const date = new Date(fecha);
    date.setHours(h, m, 0, 0);
    return date;
};