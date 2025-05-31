import db from "../Config/Connection.js"

class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async getAll() {
    const [rows] = await db.query(`SELECT * FROM ${this.tableName}`);
    return rows;
  }

  async getById(id) {
    const [rows] = await db.query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
      return rows.length > 0 ? rows[0] : null;
  }

  async getByGroupId(groupId) {
    const [rows] = await db.query(
      `SELECT u.*, g.group_name 
       FROM ${this.tableName} u
       JOIN groups g ON u.group_id = g.id
       WHERE u.group_id = ?`,
      [groupId]
    );
    return rows;
  }
    
  
  async findEmail(email) {
    const [rows] = await db.query(`SELECT * FROM ${this.tableName} WHERE email = ?`, [email]);
    return rows.length > 0 ? rows[0] : null;
  }
  
  async create(data) {
    const [result] = await db.query(`INSERT INTO ${this.tableName} SET ?`, [data]);
    return result;
  }

  async update(id, data) {
    const [result] = await db.query(`UPDATE ${this.tableName} SET ? WHERE id = ?`, [data, id]);
    return result;
  }

  async delete(id) {
    const [result] = await db.query(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
    return result;
  }
}





export default BaseModel