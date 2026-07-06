# Email guidelines

> As you build your email campaign, it's important to keep in mind how your email messaging is received across your various users and email service providers (ESPs). 

## General

Here are some quick tips to keep in mind while building your content:

- When formatting your email, use inline style sheets as CSS.
- To use one email template for both mobile and desktop versions, keep the width under 500 pixels.
- Images must be under 5&nbsp;MB. We recommend using PNG, JPEG, or GIF for maximum compatibility. Avoid SVG and WebP, as many major email clients do not yet support them.
- Don't set heights and widths for images as this can cause unnecessary white space in a degraded email.
- `div` tags should not be used as most email clients do not support their use. Instead, use nested tables.
- Avoid using JavaScript because it does not work with any ESP.
- Braze improves load times by using a global CDN to host all email images.
- On mobile, image columns are narrow (~100px each), so multi-image rows still fit (for example, four images ≈ four usable columns).

## Alternative text

Since spam filters watch for both an HTML and a plain text version of a message, utilizing plain text alternatives is a great way to lower your spam score. In addition, alternative text `(alt="")` can serve to complement and in some cases stand in lieu of images included in your email body that may have been filtered out by a user's email provider. Screen readers announce alt text to explain images, so this is an opportunity to use plain language to provide key information about an image.

## Email validation

**Important:**


Validation is used for dashboard email addresses, end-user email addresses (your customers), and from and reply-to addresses done of an email message.



Email validation happens when a user's email address is updated or is being imported into Braze by the API, CSV upload, SDK, or modified in the dashboard. Note that your email addresses cannot include whitespaces, and if sent using the API, whitespaces can result in a `400` error.

Email addresses targeted through the Braze servers must be validated per [RFC 2822](https://datatracker.ietf.org/doc/html/rfc2822) standards, Braze does not accept certain characters and recognizes them as invalid. If an email is bounced, Braze marks the email as invalid and the subscription status is not changed. 

For information about disallowed characters and email validation rules, see [Email validation](https://www.braze.com/docs/user_guide/channels/email/email_setup/email_validation/#how-it-works).

## From and reply-to addresses

When setting your "from" addresses, make sure your "from" email domain matches your sending domain (such as `marketing.yourdomain.com`). Failure to do this may result in SPF and DKIM misalignment. All reply-to emails can be set to your root domain.

**Note:**


Unicode encoding is not supported in "from" addresses.



## Attachments in email {#attachments}

When you add attachments to email messages, follow these deliverability best practices:

- Spam filters scan attachments and may flag your message
- Mail providers sometimes take longer to accept messages that include attachments
- Outside one-to-one messages, attachments can make your message look risky in the inbox.
- Keep each attachment under 2&nbsp;MB.
- Don’t send sensitive information as an attachment. Instead, send users to your secure portal to view it there instead.

## Layout (drag-and-drop and custom HTML)

Layout can break when Braze-generated HTML/CSS conflicts with custom HTML. If this occurs, do the following:

- Remove custom HTML/CSS first
- Validate custom fonts load correctly in preview
- Check row and column padding
- Prefer table-based layouts, and stay within the editor's width. 

Content Blocks that pull in HTML from outside the editor can also break the layout.

## UTM parameters in email URLs

UTM parameters tag URLs for analytics. You can build them with Liquid and custom attributes. 

- Use only one question mark `?` in the final URL (additional `?` characters can break requests). 
- Avoid spaces and special characters in values (use `_` or `-`). 
- Confirm your analytics tool ingests UTMs. Trim trailing spaces inside Liquid `capture` blocks. UTMs are case-sensitive.

### Check HTML details

Keep in mind that some HTML tags and attributes are not allowed as they may potentially let malicious code run in the browser.

Check out the following lists for HTML tags and attributes that aren't allowed in your emails:
**Expand for disallowed HTML tags**


- `<!doctype>`
- `<applet>`
- `<bgsound>`
- `<embed>`
- `<frameset>`
- `<iframe>`
- `<ilayer>`
- `<layer>`
- `<link>`
- `<meta>`
- `<object>`
- `<script>`
- `<title>`
- `<xml>`
- `<svg>`



**Expand for disallowed HTML attributes**


- `<animationend>`
- `<animationiteration>`
- `<animationstart>`
- `<data-bind>`
- `<fscommand>`
- `<onabort>`
- `<onabort>`
- `<onactivate>`
- `<onafterprint>`
- `<onafterupdate>`
- `<onbeforeactivate>`
- `<onbeforecopy>`
- `<onbeforecut>`
- `<onbeforedeactivate>`
- `<onbeforeeditfocus>`
- `<onbeforepaste>`
- `<onbeforeprint>`
- `<onbeforeunload>`
- `<onbeforeupdate>`
- `<onbegin>`
- `<onblur>`
- `<onbounce>`
- `<oncanplay>`
- `<oncanplaythrough>`
- `<oncellchange>`
- `<onchange>`
- `<onclick>`
- `<oncontextmenu>`
- `<oncontrolselect>`
- `<oncopy>`
- `<oncut>`
- `<ondataavailable>`
- `<ondatasetchanged>`
- `<ondatasetcomplete>`
- `<ondblclick>`
- `<ondeactivate>`
- `<ondrag>`
- `<ondragdrop>`
- `<ondragend>`
- `<ondragenter>`
- `<ondragleave>`
- `<ondragover>`
- `<ondragstart>`
- `<ondrop>`
- `<ondurationchange>`
- `<onemptied>`
- `<onend>`
- `<onended>`
- `<onerror>`
- `<onerror>`
- `<onerrorupdate>`
- `<onfilterchange>`
- `<onfinish>`
- `<onfocus>`
- `<onfocusin>`
- `<onfocusout>`
- `<onhashchange>`
- `<onhelp>`
- `<oninput>`
- `<oninvalid>`
- `<onkeydown>`
- `<onkeypress>`
- `<onkeyup>`
- `<onlayoutcomplete>`
- `<onload>`
- `<onloadeddata>`
- `<onloadedmetadata>`
- `<onloadstart>`
- `<onlosecapture>`
- `<onmediacomplete>`
- `<onmediaerror>`
- `<onmessage>`
- `<onmousedown>`
- `<onmouseenter>`
- `<onmouseleave>`
- `<onmousemove>`
- `<onmouseout>`
- `<onmouseover>`
- `<onmouseup>`
- `<onmousewheel>`
- `<onmove>`
- `<onmoveend>`
- `<onmovestart>`
- `<onoffline>`
- `<ononline>`
- `<onopen>`
- `<onoutofsync>`
- `<onpagehide>`
- `<onpageshow>`
- `<onpaste>`
- `<onpause>`
- `<onplay>`
- `<onplaying>`
- `<onpopstate>`
- `<onprogress>`
- `<onpropertychange>`
- `<onratechange>`
- `<onreadystatechange>`
- `<onredo>`
- `<onrepeat>`
- `<onreset>`
- `<onresize>`
- `<onresizeend>`
- `<onresizestart>`
- `<onresume>`
- `<onreverse>`
- `<onrowdelete>`
- `<onrowexit>`
- `<onrowinserted>`
- `<onrowsenter>`
- `<onscroll>`
- `<onsearch>`
- `<onseek>`
- `<onseeked>`
- `<onseeking>`
- `<onselect>`
- `<onselectionchange>`
- `<onselectstart>`
- `<onshow>`
- `<onstalled>`
- `<onstart>`
- `<onstop>`
- `<onstorage>`
- `<onsubmit>`
- `<onsuspend>`
- `<onsyncrestored>`
- `<ontimeerror>`
- `<ontimeupdate>`
- `<ontoggle>`
- `<ontouchcancel>`
- `<ontouchend>`
- `<ontouchmove>`
- `<ontouchstart>`
- `<ontrackchange>`
- `<onundo>`
- `<onunload>`
- `<onurlflip>`
- `<onvolumechange>`
- `<onwaiting>`
- `<onwheel>`
- `<seeksegmenttime>`
- `<transitionend>`





