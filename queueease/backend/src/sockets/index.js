let ioInstance = null;

// Each department gets its own "room" - the join screen and staff dashboard
// for that department subscribe to it, so a customer's phone updates the
// instant staff calls the next token, without polling the server.
function initSocket(io) {
  ioInstance = io;

  io.on("connection", (socket) => {
    socket.on("joinDepartment", (departmentId) => {
      socket.join(`department:${departmentId}`);
    });

    socket.on("leaveDepartment", (departmentId) => {
      socket.leave(`department:${departmentId}`);
    });
  });
}

// Called from controllers whenever a ticket changes state, so every
// connected client watching that department gets the fresh queue.
function emitQueueUpdate(departmentId) {
  if (!ioInstance) return;
  ioInstance.to(`department:${departmentId}`).emit("queueUpdated");
}

module.exports = { initSocket, emitQueueUpdate };
