import { Resend } from 'resend';
import pug from 'pug'
import Handlebars from 'handlebars';
import path from 'path';
import fs from 'fs'
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async function (template: string, templateData: any) {
    // Path to your HTML template
    const templatePath = path.join(__dirname, `./templates/${template}`);

    try {
        await new Promise((resolve, reject) => {
            // Read the template file
            fs.readFile(templatePath, 'utf8', async (err: any, templateContent: any) => {
                try {
                    if (err) {
                        console.error('Error reading the template file:', err);
                        return;
                    }
                    const template = Handlebars.compile(templateContent);
                    const result = template(templateData);

                    const { data, error } = await resend.emails.send({
                        from: 'Acme <onboarding@resend.dev>',
                        to: ['delivered@resend.dev'],
                        subject: 'Reset Your Password',
                        html: result
                    });
                    resolve(data)
                } catch (e) {
                    reject(e)
                }
            });
        })
    } catch (e) {
        throw new Error(e as string)
    }
}