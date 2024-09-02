/** Common config for bookstore. */
process.env.PGPASSWORD = "new_pass";

let DB_URI = `postgresql://`;

if (process.env.NODE_ENV === "test") {
  DB_URI = `${DB_URI}/books-test`;
} else {
  DB_URI = process.env.DATABASE_URL || `${DB_URI}/books`;
}


module.exports = { DB_URI };