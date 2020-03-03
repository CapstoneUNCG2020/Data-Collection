class Car{
    constructor(){
        this.type = "Jeep";
        this.year = 2014;
    }


    get Year(){
        return this.year;
    }

    set Year(e){
        this.year = e;
    }

    get Type(){
        return this.type;
    }

    set Type(e){
        this.type = e;
    }
}
module.exports = Car;
// myCar = new Car();
// console.log(myCar.Year + " " + myCar.Type);

// console.log('split');

// myCar.Year = 2000;
// console.log(myCar.Year);