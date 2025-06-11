<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BookEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public bool $success;
    public string $message;
    public string $action;
    public $book;
    public array $ordered_ids;

    public function __construct(bool $success, string $message, string $action, $book = null, array $ordered_ids = [])
    {
        $this->success     = $success;
        $this->message     = $message;
        $this->action      = $action;
        $this->book        = $book;
        $this->ordered_ids = $ordered_ids;
    }

    public function broadcastOn(): Channel
    {
        return new Channel('reverb');
    }

    public function broadcastWith(): array
    {
        return [
            'success'     => $this->success,
            'message'     => $this->message,
            'action'      => $this->action,
            'book'        => $this->book ? $this->book->toArray() : null,
            'ordered_ids' => $this->ordered_ids,
        ];
    }
}
