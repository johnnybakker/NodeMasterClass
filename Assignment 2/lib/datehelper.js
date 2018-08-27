'use strict'
const helper = {};

helper.DaysInMonth = (month, year)=>{
    return new Date(year, month, 0).getDate();
}

helper.CreateExpirationDate = (unit, duration)=>{
    return helper.AddTime(new Date(), unit, duration);
}

helper.AddTime = (date, key, value)=>{
    if(date.constructor == Date){
        switch(key.toLowerCase()){
            case "miliseconds":
                let miliseconds = value + date.getMilliseconds();
                let secondsFromMiliseconds = parseInt(miliseconds / 1000);
                date = helper.AddTime(date, "seconds", secondsFromMiliseconds);
                date.setMilliseconds(miliseconds - (secondsFromMiliseconds * 1000));
                break;
            case "seconds":
                let seconds = value + date.getSeconds();
                let minutesFromSeconds = parseInt(seconds / 60);
                date = helper.AddTime(date, "minutes", minutesFromSeconds);
                date.setSeconds(seconds - (minutesFromSeconds * 60));
                break;
            case "minutes":
                let minutes = value + date.getMinutes();
                let hoursFromMinutes = parseInt(minutes / 60);
                date = helper.AddTime(date, "hours", hoursFromMinutes);
                date.setMinutes(minutes - (hoursFromMinutes * 60));
                break;
            case "hours":
                let hours = value + date.getHours();
                let daysFromHours = parseInt(hours / 24);
                date = helper.AddTime(date, "days", daysFromHours);
                date.setHours(hours - (daysFromHours * 24));
                break;
            case "days":
                let days = value + date.getDate();
                while(days > helper.DaysInMonth(date.getMonth(), date.getFullYear())){
                    if(date.getMonth() == 12){
                        date.setMonth(1);
                        date.setFullYear(date.getFullYear() + 1); 
                    }
                    else {
                        date.setMonth(date.getMonth() + 1);
                    }
                    days = days - (helper.DaysInMonth(date.getMonth(), date.getYear()))
                }
                date.setDate(days);
                break;
            case "months":
                let months = value + date.getMonth();
                while(months > 12){
                    date.setFullYear(date.getFullYear() + 1); 
                    months = months - 12;
                }
                date.setMonth(months);
                break;
            case "years":
                date.setFullYear(value + date.getFullYear()); 
                break;
        }
        return date;
    }
}

module.exports = helper;
