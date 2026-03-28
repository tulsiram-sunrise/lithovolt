<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TransactionalMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        private readonly string $mailSubject,
        private readonly array $payload
    ) {
    }

    public function build(): self
    {
        return $this->subject($this->mailSubject)
            ->view('emails.transactional')
            ->text('emails.transactional-plain')
            ->with(array_merge($this->payload, [
                'subject' => $this->mailSubject,
            ]));
    }
}
