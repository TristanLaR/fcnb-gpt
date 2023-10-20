import { NextApiResponse } from "next";

const handler = async (req: any, res: NextApiResponse) => {
    try {
        console.log(req.body);

        res.status(200).end();

    } catch (error) {
        console.error("Error in logger: " + error);
        res.status(500).end();
    }
};

export default handler;
