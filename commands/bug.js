'use strict';
const { Broadcast, Logger } = require('ranvier');

function getReportMethod(type) {
  switch (type) {
    case 'bug':
      return Logger.error;
    case 'typo':
      return Logger.warn;
    case 'suggestion':
    default:
      return Logger.verbose;
  }
}

function getFormattedReport(player, type, description) {
  const header = getReportHeader(player, type, description);
  const specialized = getSpecializedReport(player, type, description);
  return `${header}${specialized}`;
}

function getReportHeader(player, type, description) {
  const now = (new Date()).toISOString();
  return `REPORT\nType: ${type}\nReported By: ${player.name}\nRoom: ${player.room.title}\nTime: ${now}\nDescription: ${description}\n`;
}

function getSpecializedReport(player, type, description) {
  const room = player.room;
  const serializeRoom = room => JSON.stringify({
    name: room.name,
    desc: room.description,
    entities: [...room.items, ...room.players, ...room.npcs].map(ent => ({name: ent.name, id: ent.id, desc: ent.description || '' }))
  });

  switch (type) {
    case 'bug':
      return `PlayerData: ${JSON.stringify(player.serialize())} RoomData: ${serializeRoom(room)}`;
    case 'typo':
      return `PlayerInv: ${JSON.stringify(player.inventory.serialize())} RoomData: ${serializeRoom(room)}`;
    case 'suggestion':
    default:
      return '';
  }
}

module.exports = {
  usage: 'bug <description>',
  aliases: ['typo', 'suggestion'],
  command: state => (args, player, arg0) => {
    if (!args) {
      return Broadcast.sayAt(player, '<b><yellow>Please describe the bug you have found.</yellow></b>');
    }

    const description = args;
    const type = arg0;

    const reportMethod = getReportMethod(type);
    const formattedReport = getFormattedReport(player, type, description);

    reportMethod(formattedReport);

    // TODO: Looks to me like this never worked, but no one ever set reportToAdmin to true
    // Will leave it here with a todo, because I like the idea
    // if (Config.get('reportToAdmins')) {
    //   const message = `Report from ${this.name}: ${description}. See the server logs for more details.`;
    //   const minRole = type === 'bug'
    //     ? PlayerRoles.ADMIN
    //     : PlayerRoles.BUILDER;
    //   Broadcast.sayAt(new RoleAudience({ minRole, state }), message);
    // }

    Broadcast.sayAt(player, `<b>Your ${type} report has been submitted as:</b>\n${description}`);
    Broadcast.sayAt(player, '<b>Thanks!</b>');
  }
};
