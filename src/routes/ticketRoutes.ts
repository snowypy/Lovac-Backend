import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Ticket } from "../models/Ticket";
import dotenv from 'dotenv';
import log from "../logger";
import { IsNull } from "typeorm";

dotenv.config();

const router = Router();

router.get("/", async (req: Request, res: Response) => {
    const tickets = await AppDataSource.manager.find(Ticket, { relations: ["messages"] });
    res.json(tickets);
});

const getTicketById = async (ticketId: number): Promise<Ticket | null> => {
    return await AppDataSource.manager.findOne(Ticket, {
        where: { id: ticketId },
        relations: ["messages"],
    });
};

router.get("/:id", async (req: Request, res: Response) => {
    try {
        const ticketId = parseInt(req.params.id);
        if (isNaN(ticketId)) {
            res.status(400).json({ error: "It appears that some details are missing from your request." });
            return;
        }
        const ticket = await getTicketById(ticketId);

        if (ticket) {
            res.json(ticket);
        } else {
            res.status(404).json({ error: "Regrettably, the requested ticket could not be found." });
        }
    } catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error fetching ticket:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
});

router.get("/all", async (req: Request, res: Response) => {
    try {
        const allTickets = await AppDataSource.manager.find(Ticket);
        res.json(allTickets);
    } catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error fetching all tickets:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
});

router.post("/open", async (req: Request, res: Response) => {
    try {
        const openTickets = await AppDataSource.manager.find(Ticket, {
            where: { status: "Open" },
            select: ["id"],
        });
        const openTicketIds = openTickets.map(ticket => ticket.id);
        res.json(openTicketIds);
    } catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error fetching open tickets:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
});

router.post("/closed", async (req: Request, res: Response) => {
    try {
        const closedTickets = await AppDataSource.manager.find(Ticket, {
            where: { status: "Closed" },
            select: ["id"],
        });
        const closedTicketIds = closedTickets.map(ticket => ticket.id);
        res.json(closedTicketIds);
    } catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error fetching closed tickets:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
});

router.post("/unassigned", async (req: Request, res: Response) => {
    try {
        const unassignedTickets = await AppDataSource.manager.find(Ticket, {
            where: { assignee: IsNull() },
            select: ["id"],
        });
        const unassignedTicketIds = unassignedTickets.map(ticket => ticket.id);
        res.json(unassignedTicketIds);
    } catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error fetching unassigned tickets:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
        res.status(500).json({ error: "An unexpected issue has occurred; please try again later." });
    }
});

router.post("/assigned", async (req: Request, res: Response) => {
    try {
        const { staffId } = req.body;
        if (!staffId) {
            res.status(400).json({ message: "It seems some details are missing, like a cat looking for its favorite spot." });
            return;
        }
        const assignedTickets = await AppDataSource.manager.find(Ticket, {
            where: { assignee: staffId },
            select: ["id"],
        });
        const assignedTicketIds = assignedTickets.map(ticket => ticket.id);
        res.json(assignedTicketIds);
    } catch (error) {
        log('=================================================================================================', 'error');
        log('Lovac ran into an issue, contact the developer (https://snowy.codes) for assistance.', 'error');
        log('', 'error');
        log("Error fetching assigned tickets:", "error");
        log(`${error}`, "error");
        log('=================================================================================================', 'error');
        res.status(500).json({ message: "A little hiccup has occurred; please try again later.", error });
    }
});

export default router;