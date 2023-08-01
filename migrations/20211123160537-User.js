'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('user', 'age', {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null,
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('user', 'age');
    }
};
//# sourceMappingURL=20211123160537-Items.js.map