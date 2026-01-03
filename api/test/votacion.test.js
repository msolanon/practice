const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { expect } = require('chai');

const testSchema = new Schema({
    name: { type: String, required: true }
});

//Create a new collection called 'Name'
const Name = mongoose.model('Name', testSchema);
describe('Database Tests', function () {
    //Before starting the test, create a sandboxed database connection
    before(async function () {
        await mongoose.connect('mongodb://localhost/testDatabase');
    });
    describe('Test Database', function () {
        it('New name saved to test database', async () => {
            const testName = new Name({ name: 'Mike' });
            await testName.save();

            const found = await Name.findOne({ name: 'Mike' });
            expect(found).to.exist;
            expect(found.name).to.equal('Mike');
        });

        it('Dont save incorrect format to database', async () => {
            //Attempt to save with wrong info. An error should trigger
            const wrongSave = new Name({ notName: 'Not Mike' });
            let err = null;
            try {
                await wrongSave.save();
            } catch (e) {
                err = e;
            }
            expect(err).to.exist;
        });
    });
    //After all tests are finished drop database and close connection
    after(async function () {
        try {
            await mongoose.connection.db.dropDatabase();
        } catch (e) {
            // ignore if not connected or already dropped
        }
        await mongoose.connection.close();
    });
});