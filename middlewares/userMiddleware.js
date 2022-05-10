async function validHeader(req, res, next) {

    try {
        const { authorization } = req.headers;
        const token = authorization?.replace("Bearer", "").trim();
        if (!token) {
            return res.sendStatus(401);
        }
        next();
    }
    catch {
        sendStatus(500);
    }
}

export default validHeader;

