function sendSuccess(res, payload = {}, status = 200) {
    return res.status(status).json(payload);
}

function sendCreated(res, payload = {}) {
    return res.status(201).json(payload);
}

function sendNoContent(res) {
    return res.status(204).send();
}

export { sendCreated, sendNoContent, sendSuccess };