export const getDate = (value) => {
    const date = new Date(Date.parse(value));

    function convertUTCDateToLocalDate(date) {
        let newDate = new Date(date);
        let d = newDate;
        d.setTime( d.getTime() + d.getTimezoneOffset() * 60 * 1000 );
        return [
                (d.getDate() < 10 ? '0' : '') + d.getDate(),
                ((d.getMonth() + 1) < 10 ? '0' : '') + (d.getMonth() + 1),
                d.getFullYear()].join('.') + ' ' +
            [(d.getHours() < 10 ? '0' : '') + d.getHours(),
                (d.getMinutes() < 10 ? '0' : '') + d.getMinutes(),
                (d.getSeconds() < 10 ? '0' : '') + d.getSeconds()].join(':');
    }

    const newTime = convertUTCDateToLocalDate(date);
    return newTime;
};

