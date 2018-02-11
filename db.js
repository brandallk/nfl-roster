
const sqlite3 = require('sqlite3').verbose();
const dbname = 'nflroster.sqlite';
const db = new sqlite3.Database(dbname);

db.serialize( () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS team
            (id integer primary key, apiID integer, fullname, firstname, lastname, position, pro_team, photo)
    `;
    db.run(sql);
});

class Team {
    static all(callback) {
        db.all('SELECT * FROM team', callback);
    }

    static create(player, callback) {
        const sql = `INSERT INTO team(apiID, fullname, firstname, lastname, position, pro_team, photo) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        db.run(sql, player.apiID, player.fullname, player.firstname, player.lastname, player.position, player.pro_team, player.photo, callback);
    }

    static delete(apiID, callback) {
        if (!apiID) return callback(new Error('Please provide an apiID'));
        db.run('DELETE FROM team WHERE apiID = ?', apiID, callback);
    }
}

module.exports = db;
module.exports.Team = Team;
