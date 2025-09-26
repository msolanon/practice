var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10;

const UserSchema = new mongoose.Schema(
    {
        nombreCompleto: {
            type: String,
            required: true
        },
        cedula: {
            type: String,
            required: true,
            index: { unique: true }
        },
        carne: {
            type: Array,
            required: true,
            index: { unique: true }
        },
        carrera: {
            type: Array
        },
        estado: {
            type: Boolean,
            required: true
        },
        correo: {
            type: String,
            required: true,
            index: { unique: true }
        },
        colegio: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Colegio' }],
        empleado: {
            type: Boolean,
            required: true
        },
        contrasena: {
            type: String,
            //required: true
        },
        cuenta: {
            type: String,
            index: { unique: true }
        },
        isAdmin: {
            type: Boolean,
            required: true
        }

    },
);

UserSchema.pre('save', function(next) {
    var user = this;
    // only hash the password if it has been modified (or is new)
   
    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.contrasena, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            console.log(hash);
            user.contrasena = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.contrasena, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};


module.exports = mongoose.model("User", UserSchema);
