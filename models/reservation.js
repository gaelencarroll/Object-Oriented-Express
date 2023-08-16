/** Reservation for Lunchly */


const db = require("../db");
const moment = require('moment')


/** A reservation for a party */

class Reservation {
  constructor({id, customerId, numGuests, startAt, notes}) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  set notes(val){
    this._notes = val || '';
  }
  get notes(){
    return this._notes;
  }

  set numGuests(val){
    if(val<1){
      throw new Error(`Error: reservation must have at least one guest.`)
    }
    this._numGuests = val
  }
  get numGuests(){
    return this._numGuests
  }

  set startAt(val){
    if (val instanceof Date){
      this._startAt = val
    }
    else{
      throw new Error(`Error: please enter a valid date.`)
    }
  }
  get startAt(){
    return this._startAt
  }

  get formattedStartAt(){
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a')
  }
  
  set customerId(val){
    if(this._customerId && this._customerId !== val){
      throw new Error(`Error: cannot change the value of customer id.`)
    }
    this._customerId = val;
  }
  get customerId(){
    return this._customerId;
  }

  /** formatter for startAt */


  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
          `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
        [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }

  static async get(id){
    const result = await db.query(
      `SELECT id, customer_id AS customerId, num_guests AS numGuests, start_at AS startAt, notes
      FROM reservations
      WHERE id=$1`, [id]
    )
    let res = result.row[0]

    if (res === undefined ){
      const err = new Error(`Error: reservation not found`)
      err.status = 404;
      throw err
    }

    return new Reservation(res)
  }

  async save(){
    if(this.id === undefined){
      const result = await db.query(
        `INSERT INTO reservations (customer_id, num_guests, start_at, notes)
          VALUES ($1, $2, $3, $4) RETURNING id`, [this.customerId, this.numGuests, this.startAt, this.notes]
      )
      this.id = result.rows[0].id
    }
    else{
      await db.query(
        `UPDATE reservations SET num_guests = $1, start_at = $2, notes = $3 WHERE id = $4`, [this.id, this.numGuests, this.startAt, this.notes]
      )
    }
  }
}



module.exports = Reservation;
