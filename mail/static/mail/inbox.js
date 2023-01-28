document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});


function send_email(events){
  events.preventDefault();
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      load_mailbox('sent');

  });



}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-content-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-content-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      // Print emails
      console.log(emails);

      // ... do something else with emails ...
      emails.forEach(email => {
         new_mail = document.createElement('div');
        new_mail.className = new_mail.read ? 'list-group-item ' : 'list-group-item bg-secondary';
        new_mail.innerHTML = `<h4> From: ${email.recipients}</h4><h4> To : ${email.recipients}</h4> <h5> subject : ${email.subject}</h5>
                                <h5> date: ${email.timestamp}</h5>`
                              
        document.querySelector('#emails-view').append(new_mail,new_mail.id);
        new_mail.addEventListener('click' ,() => click_event(email));

      });
  });
}

function click_event(mail,id){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-content-view').innerHTML = '';
  document.querySelector('#email-content-view').style.display = 'block';

  email_content =  document.createElement('div');
  email_content.innerHTML =  `<ul> 
                                <li> From: ${mail.sender}</li>
                                <li> To: ${mail.recipients}</li>
                                <li> Subject: ${mail.subject}<li>
                              </ul>
                              <p> ${mail.body}</p>`


    document.querySelector('#email-content-view').append(email_content);
    if(!mail.read){
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      });
    }

    const archive_button = document.createElement('button');
    archive_button.innerHTML = mail.archived ? 'Unarchive' : 'Archive';
    document.querySelector('#email-content-view').append(archive_button);
    archive_button.addEventListener('click', function() {

      fetch(`/emails/${id}`, {
         method: 'PUT',
          body: JSON.stringify({
            archived: !mail.archived
          })
        })
        .then(() => load_mailbox('archive'));
    });


    
    const reply_button = document.createElement('reply');
    reply_button.innerHTML =  'Reply';
    document.querySelector('#email-content-view').append(reply_button);
    reply_button.addEventListener('click', function() {
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#email-content-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'block';

      // Clear out composition fields
      document.querySelector('#compose-recipients').value = mail.sender;
      document.querySelector('#compose-subject').value = `Re: ${mail.subject}`;
      document.querySelector('#compose-body').value = `On ${mail.timestamp} ${mail.recipients} wrote: `;

    });



 }