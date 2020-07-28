const { ImapFlow } = require('imapflow');
// const util = require('util');
const LAST_X_DAYS =  process.env.LAST_X_DAYS

module.exports.makeAsRead = async (config, seqId) => {
    // Wait until client connects and authorizes
    const client = new ImapFlow(config);
    await client.connect();

    // Select and lock a mailbox. Throws if mailbox does not exist
    let lock = await client.getMailboxLock('INBOX');
    try {
        // fetch latest message source     
        let response = await client.messageFlagsAdd(seqId, ['\\SEEN']);
   
    } finally {
        // Make sure lock is released, otherwise next `getMailboxLock()` never returns
        lock.release();
    }

    // log out and close connection
    await client.logout();
    return [true, {makeAsRead:true}];
};

const connect  = async (config) => {
    const client = new ImapFlow(config);
    try{
        await client.connect();
        return client
    } catch(err) {
        throw err
    }
    
} 
module.exports.fetch = async (config) => {
    // Wait until client connects and authorizes
    const client = await connect(config)
    // Select and lock a mailbox. Throws if mailbox does not exist
    let lock = await client.getMailboxLock('INBOX');
    let results = []
    try {

        // {since: "Tue Jul 21 2020 10:56:08 GMT+0530"}
        // we can query everything.. but for simplicity i have kept it for customizable days
        let queryDate = new Date();
        queryDate.setDate(queryDate.getDate() - LAST_X_DAYS);
        queryDate = queryDate.toDateString();
        const primaryFilter = { seq:true,  flags:true, envelope:true }
        const messages = client.fetch({since: queryDate}, primaryFilter, primaryFilter)
        for await (let message of messages) {
            let t = {
                from: message.envelope.from.map(e => e.name).join(","),
                subject: message.envelope.subject,
                seq: message.seq,
                seen: message.flags.has('\\Seen')
            }
            console.log(JSON.stringify(t))
            results.push(t)
        //   console.log(util.inspect(message, false, 22));
        }
    } finally {
        // Make sure lock is released, otherwise next `getMailboxLock()` never returns
        lock.release();
    }

    // log out and close connection
    await client.logout();
    results = results.reverse()
    return [true, results]
};

module.exports.fetchDetails = async (config, seq) => {
    // Wait until client connects and authorizes
    const client = await connect(config)

    // Select and lock a mailbox. Throws if mailbox does not exist
    let lock = await client.getMailboxLock('INBOX');
    let mailContent = null
    try {
        if (seq) {
            let {content } = await client.download(seq, '1', { seq: true, envelope:true });
            if (content) {
                let buf = [];
                await new Promise(resolve => {
                    content.on('readable', () => {
                        let chunk;
                        while ((chunk = content.read()) !== null) {
                            buf.push(chunk);
                        }
                    });
                    content.once('end', () => {
                        mailContent = Buffer.concat(buf).toString();
                        resolve();
                    });
                });
            
            }

        }
    } finally {
        // Make sure lock is released, otherwise next `getMailboxLock()` never returns
        lock.release();
    }

    // log out and close connection
    await client.logout();
    return [true, {seq, mailContent}]
};


